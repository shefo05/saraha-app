import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const generateToken = (payload, secret, expireTime) => {
  payload.jti = crypto.randomBytes(10).toString("hex");
  const token = jwt.sign(payload, secret, {
    expiresIn: expireTime,
  });
  return token;
};

export function generateTokens(payload) {
  const accessToken = generateToken(
    payload,
    "vhfdsfgkfsutgrufdkcxzvjkvuirlficubzliuxvaspi",
    3600,
  );

  const refreshToken = generateToken(
    payload,
    "kkkkkfkfkfkfkfghfsfdgfysdgyuzfcvytxcvxcuczcftvffuygastjkg",
    "1y",
  );

  return { accessToken, refreshToken };
}
