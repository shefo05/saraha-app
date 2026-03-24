import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, html } = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "shafeelgendy@gmail.com",
      pass: "ilgl hsep aifn voiu",
    },
  });

  await transporter.sendMail({
    from: '"Saraha App"<shafeelgendy@gmail.com>',
    to,
    subject,
    html,
  });
};
