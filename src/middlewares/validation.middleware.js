import joi from "joi";
import { BadReqException, SYS_GENDER, SYS_ROLE } from "../common/index.js";

export const validationLayer = (schema) => {
  return (req, res, next) => {
    const validationResult = schema.validate(req.body, {
      abortEarly: false,
    });

    // console.log(validationResult);
    if (validationResult.error) {
      let errorMessages = validationResult.error.details.map((err) => {
        return { message: err.message, path: err.path[0] };
      });
      console.log(errorMessages);
      throw new BadReqException("validation faild", errorMessages);
    }
    next();
  };
};

export const generalFields = {
  name: joi
    .string()
    .min(2)
    .max(20)
    .trim()
    .messages({
      "string.base": "name must be string",
      "any.required": "name is required",
      "string.min": "name must be more than or equal to 2 characters long",
      "string.max": "name must be less than or equal to 20 characters long",
    })
    .required(),
  email: joi
    .string()
    .email({ tlds: ["gmail", "yahoo"] })
    .messages({
      "string.email": "email must be a valid email",
    })
    .when("phone", {
      is: joi.exist(),
      then: joi.optional(),
      otherwise: joi.required(),
    }),
  password: joi
    .string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .message(
      `password must be
           At least 8 characters in length
           Contains at least one lowercase letter (a-z)
           Contains at least one uppercase letter (A-Z)
           Contains at least one digit (0-9) Contains at least one specialcharacter from @$!%*?&`,
    )
    .required(),
  repassword: joi
    .string()
    .valid(joi.ref("password"))
    .messages({ "any.only": "rePassword must match password" })
    .required(),
  gender: joi
    .number()
    .valid(...Object.values(SYS_GENDER))
    .default(0),
  role: joi
    .number()
    .valid(...Object.values(SYS_ROLE))
    .default(0),
  phone: joi
    .string()
    .pattern(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/)
    .messages({
      "string.pattern.base": "phone must be a valid Egyptian phone number",
    }),
};
