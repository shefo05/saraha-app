import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
import { BadReqException } from "../common/index.js";

// Middleware to validate file type by magic number (file signatures)
export const fileValidation = async (req, res, next) => {

  // get the file path
  const filePath = req.file.path;
  // read the file and return buffer
  const buffer = fs.readFileSync(filePath);
  // get the file type
  const type = await fileTypeFromBuffer(buffer);
  // validate
  const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
  if (!type || !allowedTypes.includes(type.mime)) {
    fs.unlinkSync(filePath);
    return next(new BadReqException("Invalid file type"));
  }
  return next();
};
