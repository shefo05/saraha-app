import {
  BadReqException,
  compare,
  ConflictException,
  encryption,
  hash,
  sendMail,
  SYS_MESSAGE,
} from "../../common/index.js";
import { otpRepository } from "../../DB/models/otp/otp.repository.js";
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
    sub: authenticatedUser._id,
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
