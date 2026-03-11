import { userRepository } from "../../DB/models/user/user.repository.js";

export const checkUserExist = async (filter, projection = {}) => {
  return await userRepository.getOne(filter, projection);
};

export const createUser = async (userData) => {
  return await userRepository.create(userData);
};
