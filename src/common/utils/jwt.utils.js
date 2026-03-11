import jwt from "jsonwebtoken";


export const generateToken = (payload,secret, expireTime) => {
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