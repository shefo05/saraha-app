import { DBRepositort } from "../../DB.repository.js";
import { User } from "./user.model.js";

class UserRepository extends DBRepositort {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
