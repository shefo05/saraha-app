import {
  compare,
  ConflictException,
  encryption,
  hash,
  SYS_MESSAGE,
} from "../../common/index.js";
import { checkUserExist, createUser } from "../users/users.service.js";
import jwt from "jsonwebtoken";

export const signup = async (userData) => {
  const userExist = await checkUserExist({
    email: { $eq: userData.email, $exists: true, $ne: null },
  });
  if (userExist) throw new ConflictException(SYS_MESSAGE.user.alreadyExist);

  userData.password = await hash(userData.password);
  userData.phone = encryption(userData.phone);

  return await createUser(userData);
};



export const signinAuth = async ({ email, password }) => {
  const userExist = await checkUserExist({
    email: { $eq: email, $exists: true, $ne: null },
  });
  const match = await compare(password, userExist?.password || "qqqqqq");
  if (!match) return null;

  if (!userExist) return null;
  return userExist;
};

export const verifyToken = (
  token,
  secret = "vhfdsfgkfsutgrufdkcxzvjkvuirlficubzliuxvaspi",
) => {
  const payload = jwt.verify(token, secret);
  return payload;
};


