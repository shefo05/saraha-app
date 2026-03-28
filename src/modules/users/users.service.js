import {
  BadReqException,
  NotFoundException,
  SYS_MESSAGE,
} from "../../common/index.js";
import { userRepository } from "../../DB/models/user/user.repository.js";
import path from "node:path";
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

export const uploadCoverPic = async (user, file) => {
  const userDir = `uploads/${user._id}/cover picture`;
  const updatedUser = await userRepository.update(
    { _id: user._id },
    { coverPic: file.path },
  );
  if (!updatedUser) throw new NotFoundException(SYS_MESSAGE.user.notFound);

  const files = fs.readdirSync(userDir);
  let fileDetails = files.map((filename) => {
    const filePath = path.join(userDir, filename);
    const stats = fs.statSync(filePath);

    return {
      name: filename,
      path: filePath,
      time: stats.birthtimeMs,
    };
  });
  fileDetails.sort((a, b) => a.time - b.time);

  while (fileDetails.length > 2) {
    const oldest = fileDetails.shift();
    fs.unlinkSync(oldest.path);
  }

  // if (user.profilePic) fs.unlinkSync(user.profilePic);
  return updatedUser;
};

export const deleteProfilePic = async (user) => {
  if (!user.profilePic) {
    throw new BadReqException("no profile picture found");
  }

  if (fs.existsSync(user.profilePic)) {
    fs.unlinkSync(user.profilePic);
  }

  const updatedUser = await userRepository.update(
    { _id: user._id },
    { $unset: { profilePic: "" } },
  );

  if (!updatedUser) throw new NotFoundException(SYS_MESSAGE.user.notFound);

  return updatedUser;
};
