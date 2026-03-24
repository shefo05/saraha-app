import { Router } from "express";
import {
  signup,
  signinAuth,
  verifyToken,
  getTokens,
  verifyEmail,
  sendOtp,
} from "./auth.service.js";
import { SYS_MESSAGE } from "../../common/index.js";
import { validationLayer } from "../../middlewares/index.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { fileUpload } from "../../common/utils/multer.utils.js";

const router = Router();

router.post(
  "/signup",
  fileUpload().none(),
  validationLayer(signupSchema),
  async (req, res, next) => {
    const createdUser = await signup(req.body);

    return res.status(201).json({
      message: SYS_MESSAGE.user.created,
      success: true,
      data: { createdUser },
    });
  },
);

router.post(
  "/signin",
  fileUpload().none(),
  validationLayer(loginSchema),
  async (req, res, next) => {
    const { accessToken, refreshToken } = await signinAuth(req.body);

    return res.status(200).json({
      message: "login successfully",
      success: true,
      data: { accessToken, refreshToken },
    });
  },
);

router.get("/refresh-token", (req, res, next) => {
  const { authorization } = req.headers;

  const { accessToken, refreshToken } = getTokens(authorization);

  return res.status(200).json({
    message: "token refresh successfully",
    sucess: true,
    accessToken,
    refreshToken,
  });
});

router.patch("/verify-email", async (req, res, next) => {
  const emailVerified = await verifyEmail(req.body);
  return res.status(200).json({
    message: "email verified successfully",
    success: emailVerified,
  });
});

router.post("/send-otp", async (req, res, next) => {
  await sendOtp(req.body);
  return res
    .status(200)
    .json({ message: "otp sent successfully !", success: true });
});

export default router;
