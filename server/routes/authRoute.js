import express from 'express';
import { signUp, login, userVerification, forgotPassword, resetPassword } from '../controller/authController.js';
const router = express.Router();
router.post("/signUp", signUp);
router.post("/login", login);
router.get("/user/userVerification/:tempToken", userVerification);
router.post("/forgot-password",forgotPassword)
router.post("/reset-password",resetPassword)
export default router;