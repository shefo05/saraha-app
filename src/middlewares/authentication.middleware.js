import {
  BadReqException,
  NotFoundException,
  SYS_MESSAGE,
} from "../common/index.js";
import { tokenRepository } from "../DB/models/token/token.repository.js";
import { verifyToken } from "../modules/auth/auth.service.js";
import { checkUserExist } from "../modules/users/users.service.js";

export const isAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;
  const payload = verifyToken(authorization);

  const user = await checkUserExist({ _id: payload.sub });
  // const user = await userRepository.getOne(  payload.sub );
  if (!user) throw new NotFoundException(SYS_MESSAGE.user.notFound);

  // console.log({
  //   credentialsUpdatedAt: new Date(user.credentialsUpdatedAt).getTime(),
  //   tokenIat: payload.iat * 1000,
  // });

  if (new Date(user.credentialsUpdatedAt).getTime() > payload.iat * 1000) {
    throw new BadReqException(SYS_MESSAGE.user.failToUpdate);
  }

  const tokenExist = await tokenRepository.getOne({ token: payload.jti });
  if (tokenExist) {
    throw new BadReqException("invalid token, signin again");
  }

  req.user = user;
  req.payload = payload;
  next();
};
