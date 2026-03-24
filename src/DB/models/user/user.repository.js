import { DBRepository } from "../../DB.repository.js";
import { User } from "./user.model.js";

class UserRepository extends DBRepository {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
