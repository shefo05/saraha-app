import { Router } from "express";
import {
  decryption,
  NotFoundException,
  SYS_GENDER,
  SYS_MESSAGE,
} from "../../common/index.js";
import { isAuthenticated } from "../../middlewares/index.js";
import { fileUpload } from "../../common/index.js";
import { fileValidation } from "../../middlewares/index.js";
import {
  checkUserExist,
  deleteProfilePic,
  uploadCoverPic,
  uploadProfilePic,
} from "./users.service.js";
import { userRepository } from "../../DB/models/user/user.repository.js";

const router = Router();

router.get("/:id", isAuthenticated, async (req, res, next) => {
  const authUser = req.user;
  const { id } = req.params;

  await userRepository.update({ _id: id }, { $inc: { visitorCount: 1 } });

  const profileDoc = await checkUserExist({ _id: id });
  if (!profileDoc) throw new NotFoundException(SYS_MESSAGE.user.notFound);

  const profile = profileDoc.toObject();

  if (profile.phone) {
    profile.phone = decryption(profile.phone);
  }

  delete profile.password;
  console.log(authUser);

  if (!(authUser.role === 1 || authUser.role === 2)) {
    delete profile.visitorCount;
  }
  console.log(profile);

  return res.status(200).json({
    success: true,
    profile: profile,
  });
});

router.patch(
  "/upload-profile-pic",
  isAuthenticated,
  fileUpload(
    ["image/png", "image/jpeg", "image/gif"],
    "profile picture",
  ).single("pp"),
  fileValidation,
  async (req, res, next) => {
    const updatedUser = await uploadProfilePic(req.user, req.file);

    return res.json({ message: "done", success: true, user: updatedUser });
  },
);

router.patch("/delete-profile-pic", isAuthenticated, async (req, res, next) => {
  const userData = await deleteProfilePic(req.user);

  return res.json({
    message: "Profile picture deleted successfully",
    success: true,
    user: userData,
  });
});

router.patch(
  "/upload-cover-pic",
  isAuthenticated,
  fileUpload(["image/png", "image/jpeg", "image/gif"], "cover picture").single(
    "pp",
  ),
  fileValidation,
  async (req, res, next) => {
    const updatedUser = await uploadCoverPic(req.user, req.file);

    return res.json({ message: "done", success: true, user: updatedUser });
  },
);
export default router;
