import { Router } from "express";
import { decryption } from "../../common/index.js";
import { isAuthenticated } from "../../middlewares/index.js";

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

export default router;
