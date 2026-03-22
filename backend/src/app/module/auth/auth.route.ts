import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();

import auth from "../../middleware/auth.js";

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/logout", AuthController.logoutUser);
router.get("/me", auth(), AuthController.getMe);

export const AuthRoutes = router;
