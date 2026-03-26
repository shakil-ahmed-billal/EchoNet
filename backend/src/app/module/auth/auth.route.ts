import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get("/me", auth(), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);
router.post("/change-password", auth(), AuthController.changePassword);
router.post("/logout", AuthController.logoutUser);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);

// Google OAuth
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);

export const AuthRoutes = router;
