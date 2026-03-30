import {
  BadReqException,
  compare,
  ConflictException,
  encryption,
  generateTokens,
  hash,
  NotFoundException,
  sendMail,
  SYS_MESSAGE,
} from "../../common/index.js";
import { OAuth2Client } from "google-auth-library";

import { userRepository } from "../../DB/models/user/user.repository.js";
import { redisClient } from "../../DB/redis.connection.js";
import { checkUserExist, createUser } from "../users/users.service.js";
import jwt from "jsonwebtoken";

export const signup = async (userData) => {
  const { email, phone, password } = userData;
  const userExist = await checkUserExist({
    email: { $eq: email, $exists: true, $ne: null },
  });
  if (userExist) throw new ConflictException(SYS_MESSAGE.user.alreadyExist);

  userData.password = await hash(password);
  userData.rePassword = undefined;
  if (phone) userData.phone = encryption(phone);

  await sendOtp(userData);

  await redisClient.set(email, JSON.stringify(userData), { EX: 24 * 60 * 60 });

  // return await createUser(userData);
};

export async function sendOtp(body) {
  const { email } = body;

  // const otpDoc = await otpRepository.getOne({ email });

  const otpDoc = await redisClient.exists(`${email}:otp`);

  if (otpDoc)
    throw new BadReqException("can't send new otp, your otp still valid !");
  const otp = Math.floor(100000 + Math.random() * 900000);

  await redisClient.set(`${email}:otp`, otp, { EX: 120 });

  // await otpRepository.create({
  //   email,
  //   otp,
  //   expiresAt: Date.now() + 5 * 60 * 1000,
  // });

  await sendMail({
    to: email,
    subject: "verify your account",
    html: `<p>your otp to verify your account is ${otp}</p>`,
  });
}

export const signinAuth = async ({ email, password }) => {
  const userExist = await checkUserExist({
    email: { $eq: email, $exists: true, $ne: null },
  });

  let loginAttempts = Number(
    await redisClient.get(`${userExist.email}:loginAttempts`),
  );
  if (loginAttempts == 5) {
    throw new BadReqException("you are banned for 5 minutes");
  }

  if (!loginAttempts) loginAttempts = 0;
  const match = await compare(password, userExist?.password || "qqqqqq");

  if (!userExist) throw new BadReqException("invalid credentials");

  if (!match) {
    loginAttempts += 1;
    await redisClient.set(`${userExist.email}:loginAttempts`, loginAttempts, {
      EX: 5 * 60,
    });
    if (loginAttempts == 5)
      throw new BadReqException("you are banned for 5 minutes");
    throw new BadReqException("invalid credentials");
  }

  // userExist.password = undefined;
  if (userExist.twoStepVer) {
    await sendOtp(userExist);
    return {
      message:
        "go ot 2-step-verfication endpoint, and enter the otp sent to your email",
    };
  }
  const { accessToken, refreshToken } = generateTokens({
    sub: userExist._id,
  });

  userRepository.update({ email: userExist.email }, { isLoggedOut: false });
  return { message: "logged in successfully", accessToken, refreshToken };
};

export const verifyToken = (
  token,
  secret = "vhfdsfgkfsutgrufdkcxzvjkvuirlficubzliuxvaspi",
) => {
  const payload = jwt.verify(token, secret);
  return payload;
};

export const getTokens = (authorization) => {
  const payload = verifyToken(
    authorization,
    "kkkkkfkfkfkfkfghfsfdgfysdgyuzfcvytxcvxcuczcftvffuygastjkg",
  );
  delete payload.iat;
  delete payload.exp;

  const { accessToken, refreshToken } = generateTokens(payload);
  return { accessToken, refreshToken };
};

export const verifyEmail = async (body) => {
  const { otp, email } = body;
  // const otpDoc = await otpRepository.getOne({ email });
  const otpDoc = await redisClient.get(`${email}:otp`);
  if (!otpDoc) throw new BadReqException("expired otp number !");
  if (otp != otpDoc) {
    //   otpDoc.attempts += 1;

    //   if (otpDoc.attempts > 3) {
    //     await otpRepository.deleteOne({ _id: otpDoc._id });
    //     throw new BadReqException("too many tries !");
    //   }
    //   await otpDoc.save();
    throw new BadReqException("invalid otp number !");
  }
  // await userRepository.update({ email }, { isEmailVerified: true });
  let data = await redisClient.get(email);
  data = JSON.parse(data);

  if (!(await checkUserExist({ email }))) {
    await userRepository.create(data);
  }
  await redisClient.del(email);
  // await otpRepository.deleteOne({ _id: otpDoc._id });
  await redisClient.del(`${email}:otp`);

  return true;
};

export const logoutFromAllDevices = async (user) => {
  await userRepository.update(
    { _id: user._id },
    { credentialsUpdatedAt: Date.now() },
  );
};

export const logout = async (tokenPayload) => {
  // await tokenRepository.create({
  //   token: tokenPayload.jti,
  //   userId: tokenPayload.sub,
  //   expiresAt: tokenPayload.exp * 1000,
  // });
  await redisClient.set(`bl_${tokenPayload.jti}`, tokenPayload.jti, {
    EX: Math.floor(
      (new Date(tokenPayload.exp * 1000).getTime() - Date.now()) / 1000,
    ),
  });
  userRepository.update({ _id: tokenPayload.sub }, { isLoggedOut: true });
};

async function googleVerifyToken(idToken) {
  const client = new OAuth2Client(
    "616442572534-iobv83qf5b9r36v4l6k2te18effkpv7u.apps.googleusercontent.com",
  );
  const ticket = await client.verifyIdToken({ idToken });
  return ticket.getPayload();
}

export const loginWithGoogle = async (idToken) => {
  const googlePayload = await googleVerifyToken(idToken);
  if (googlePayload.email_verified == false) {
    throw new BadReqException("refused email from google");
  }
  const user = await userRepository.getOne({ email: googlePayload.email });

  if (!user) {
    const createdUser = await userRepository.create({
      email: googlePayload.email,
      profilePic: googlePayload.picture,
      name: googlePayload.name,
      isEmailVerified: true,
      provider: "google",
    });
    return generateTokens({
      sub: createUser._id,
      role: createdUser.role,
      provider: createdUser.provider,
    });
  }

  return generateTokens({
    sub: user._id,
    role: user.role,
    provider: user.provider,
  });
};

export const twoStepVerfication = async (body) => {
  const emailVerified = await verifyEmail(body);
  const user = await checkUserExist({ email: body.email });
  if (!user) throw new NotFoundException(SYS_MESSAGE.user.notFound);

  if (!user.isLoggedOut) {
    await userRepository.update({ email: body.email }, { twoStepVer: true });
    return { message: "2-step-verfication acctivated" };
  }
  const { accessToken, refreshToken } = generateTokens({
    sub: user._id,
  });
  userRepository.update({ email: body.email }, { isLoggedOut: false });
  return {
    accessToken,
    refreshToken,
  };
};

export const resetPassword = async (user, body) => {
  const { password, rePassword } = body;

  if (password != rePassword)
    throw new BadReqException("password not match rePassword");
  await userRepository.update({ _id: user._id }, { password, rePassword });
  user.password = await hash(password);
  user.rePassword = rePassword;
  user.save();
  return true;
};
