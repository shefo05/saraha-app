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
https://shafeelgendy-7884847.postman.co/workspace/node-work~6417598d-f5d0-42d9-bd95-8ed585cac826/collection/48436583-42937d9c-5be4-4827-820e-56f3fbc68ed5?action=share&source=copy-link&creator=48436583
---

## 🚀 How to Run

```bash
npm install
npm run dev
