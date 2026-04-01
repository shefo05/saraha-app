# 🚀 Saraha App API

A fully featured backend API for anonymous messaging system (Saraha-like app) built with Node.js and Express.

---

## ✨ Features

### 🔐 Authentication System
- User Signup & Signin
- JWT Authentication
- Refresh Tokens
- Logout (single device & all devices)

### 📧 Email & Security
- OTP Email Verification
- Two-Factor Authentication (2FA)

### 👤 User Features
- Get user profile
- Upload profile & cover images
- Delete profile images

---

## 🛠 Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Multer (File Upload)

---

## 📡 API Endpoints

### Auth
- POST `/auth/signup`
- POST `/auth/signin`
- GET `/auth/refresh-token`
- PATCH `/auth/logout`
- PATCH `/auth/logout-from-all-devices`
- POST `/auth/send-otp`
- PATCH `/auth/verify-email`
- PATCH `/auth/2-step-verfication`
- PATCH `/auth/reset-password`

### User
- GET `/user/:id`
- PATCH `/user/upload-profile-pic`
- PATCH `/user/upload-cover-pic`
- PATCH `/user/delete-profile-pic`

---

## 📬 Postman Collection
👉 Add your Postman link here

---

## 🚀 How to Run

```bash
npm install
npm run dev
