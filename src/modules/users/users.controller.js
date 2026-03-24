import { Router } from "express";
import { decryption, NotFoundException } from "../../common/index.js";
import { isAuthenticated } from "../../middlewares/index.js";
import { fileUpload } from "../../common/index.js";
import { fileValidation } from "../../middlewares/index.js";
import { uploadProfilePic } from "./users.service.js";

const router = Router();

router.get("/", isAuthenticated, async (req, res, next) => {
  const { user } = req;

  if (user.phone) {
    user.phone = decryption(user.phone);
  }
  return res.status(200).json({
    success: true,
    profile: user,
  });
});

router.patch(
  "/upload-profile-pic",
  isAuthenticated,
  fileUpload().single("pp"),
  fileValidation,
  async (req, res, next) => {
    const updatedUser = await uploadProfilePic(req.user, req.file);

    return res.json({ message: "done", success: true, user: updatedUser });
  },
);

export default router;
