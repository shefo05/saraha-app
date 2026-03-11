import { NotFoundException, SYS_MESSAGE } from "../common/index.js";
import { verifyToken } from "../modules/auth/auth.service.js";
import { checkUserExist } from "../modules/users/users.service.js";

export const isAuthenticated = async (req, res, next) => {
  const { authorization } = req.headers;
  const payload = verifyToken(authorization);

    const user = await checkUserExist({ _id: payload.sub });
  // const user = await userRepository.getOne(  payload.sub );
  if (!user) throw new NotFoundException(SYS_MESSAGE.user.notFound);
  req.user = user;
  next();
};
