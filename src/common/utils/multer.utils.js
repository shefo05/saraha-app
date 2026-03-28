import multer, { diskStorage } from "multer";
import fs from "node:fs";
import { BadReqException } from "./error.utils.js";

export const fileUpload = (
  allowedFormat = ["image/png", "image/jpeg", "image/gif"],imgType // imgType => cover || profile
) => {
  return multer({
    fileFilter: (req, file, cb) => {

      if (!allowedFormat.includes(file.mimetype)) {

        return cb(new BadReqException("invalid file format"), false);
      }
      cb(null, true);
    },
    // limits: { fileSize: 500000 },
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (!fs.existsSync(`uploads/${req.user._id}/${imgType}`)) {
          fs.mkdirSync(`uploads/${req.user._id}/${imgType}`);
        }
        cb(null, `uploads/${req.user._id}/${imgType}`);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + Math.random() + "__" + file.originalname);
      },
    }),
  });
};
