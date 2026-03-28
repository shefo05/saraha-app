import { Router } from "express";
import {
  signup,
  signinAuth,
  getTokens,
  verifyEmail,
  sendOtp,
  logoutFromAllDevices,
  logout,
  loginWithGoogle,
} from "./auth.service.js";
import { SYS_MESSAGE } from "../../common/index.js";
import { isAuthenticated, validationLayer } from "../../middlewares/index.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { fileUpload } from "../../common/utils/multer.utils.js";
import { OAuth2Client } from "google-auth-library";

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

router.patch(
  "/logout-from-all-devices",
  isAuthenticated,
  async (req, res, next) => {
    await logoutFromAllDevices(req.user);
    return res
      .status(200)
      .json({ message: "logout from all devices", success: true });
  },
);

router.post("/logout", isAuthenticated, async (req, res, next) => {
  await logout(req.payload);
  return res
    .status(200)
    .json({ message: "logout from device successfully", success: true });
});

router.post("/login-with-google", async (req, res, next) => {
  const { idToken } = req.body;
  const { accessToken, refreshToken } = await loginWithGoogle(idToken);

  return res.status(200).json({
    message: "login successfully",
    success: true,
    data: { accessToken, refreshToken },
  });
});

export default router;
