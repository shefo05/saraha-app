import { NotFoundException, SYS_MESSAGE } from "../../common/index.js";
import { userRepository } from "../../DB/models/user/user.repository.js";
import fs from "node:fs";

export const checkUserExist = async (filter, projection = {}) => {
  return await userRepository.getOne(filter, projection);
};

export const createUser = async (userData) => {
  return await userRepository.create(userData);
};

export const uploadProfilePic = async (user, file) => {
  const updatedUser = await userRepository.update(
    { _id: user._id },
    { profilePic: file.path },
  );
  if (!updatedUser) throw new NotFoundException(SYS_MESSAGE.user.notFound);

  if (user.profilePic) fs.unlinkSync(user.profilePic);
  return updatedUser;
};
