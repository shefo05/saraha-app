import joi from "joi";
import { SYS_GENDER, SYS_ROLE } from "../../common/index.js";
import { generalFields } from "../../middlewares/validation.middleware.js";
// {
//     "email":"k6@ex.com  ",
//     "password": "123456",
//     "phone": "01354567890",
//     "name": "kBghj",
//     "age":"19",
//     "gender":""
// }
export const signupSchema = joi
  .object({
    name: generalFields.name,
    email: generalFields.email,
    phone: generalFields.phone,
    gender: generalFields.gender,
    role: generalFields.role,
    password: generalFields.password,
    rePassword: generalFields.repassword,
  })
 
  // .or("email","phone")
  // .messages({
  //   "any.required": "signup data is required",
  // })
  .required();

export const loginSchema = joi
  .object({
    email: generalFields.email,
    password: generalFields.password,
  })
  .required();
