import {
  BadReqException,
  compare,
  ConflictException,
  encryption,
  generateTokens,
  hash,
  sendMail,
  SYS_MESSAGE,
} from "../../common/index.js";
import { otpRepository } from "../../DB/models/otp/otp.repository.js";
import { tokenRepository } from "../../DB/models/token/token.repository.js";
import { userRepository } from "../../DB/models/user/user.repository.js";
import { checkUserExist, createUser } from "../users/users.service.js";
import jwt from "jsonwebtoken";

export const signup = async (userData) => {
  const userExist = await checkUserExist({
    email: { $eq: userData.email, $exists: true, $ne: null },
  });
  if (userExist) throw new ConflictException(SYS_MESSAGE.user.alreadyExist);

  userData.password = await hash(userData.password);
  if (userData.phone) userData.phone = encryption(userData.phone);

  await sendOtp(userData);

  return await createUser(userData);
};

export async function sendOtp(body) {
  const { email } = body;

  const otpDoc = await otpRepository.getOne({ email });
  if (otpDoc)
    throw new BadReqException("can't send new otp, your otp still valid !");

  const otp = Math.floor(100000 + Math.random() * 900000);

  await otpRepository.create({
    email: email,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

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
  const match = await compare(password, userExist?.password || "qqqqqq");

  if (!match) throw new BadReqException("invalid credentials");

  if (!userExist) throw new BadReqException("invalid credentials");

  // userExist.password = undefined;

  const { accessToken, refreshToken } = generateTokens({
    sub: userExist._id,
  });
  return { accessToken, refreshToken };
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
  const otpDoc = await otpRepository.getOne({ email });
  if (!otpDoc) throw new BadReqException("invalid otp number !");
  if (otp != otpDoc.otp) {
    otpDoc.attempts += 1;

    if (otpDoc.attempts > 3) {
      await otpRepository.deleteOne({ _id: otpDoc._id });
      throw new BadReqException("too many tries !");
    }
    await otpDoc.save();
    throw new BadReqException("invalid otp number !");
  }
  await userRepository.update({ email }, { isEmailVerified: true });
  await otpRepository.deleteOne({ _id: otpDoc._id });

  return true;
};

export const logoutFromAllDevices = async (user) => {
  await userRepository.update(
    { _id: user._id },
    { credentialsUpdatedAt: Date.now() },
  );
};

export const logout = async (tokenPayload) => {
  await tokenRepository.create({
    token: tokenPayload.jti,
    userId: tokenPayload.sub,
    expiresAt: tokenPayload.exp * 1000,
  });
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
