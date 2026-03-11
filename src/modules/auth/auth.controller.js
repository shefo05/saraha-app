import { Router } from "express";
import {
  signup,
  signinAuth,
  verifyToken,
} from "./auth.service.js";
import { BadReqException, generateTokens, SYS_MESSAGE } from "../../common/index.js";


const router = Router();

router.post("/signup", async (req, res, next) => {
  const createdUser = await signup(req.body);
  // const userData = req.body;
  return res.status(201).json({
    message: SYS_MESSAGE.user.created,
    success: true,
    data: { createdUser },
  });
});

router.post("/signin", async (req, res, next) => {
  const authenticatedUser = await signinAuth(req.body);

  if (!authenticatedUser) throw new BadReqException("invalid credentials");
  // userExist.password = undefined;

  
  const { accessToken,refreshToken } = generateTokens({sub:authenticatedUser._id})


  return res.status(200).json({
    message: "login successfully",
    success: true,
    data: { accessToken, refreshToken },
  });
});

router.get("/refresh-token", (req, res, next) => {
  const { authorization } = req.headers;

  const payload = verifyToken(
    authorization,
    "kkkkkfkfkfkfkfghfsfdgfysdgyuzfcvytxcvxcuczcftvffuygastjkg",
  );
  delete payload.iat;
  delete payload.exp;

  const { accessToken,refreshToken } = generateTokens(payload)

  return res.status(200).json({
    message: "token refresh successfully",
    sucess: true,
    accessToken,
    refreshToken
    
  })
});



export default router;
