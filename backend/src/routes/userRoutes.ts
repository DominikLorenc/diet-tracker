import { Router } from "express";
import { register, login, logout } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/login", authRateLimiter, login);
router.post("/register", authRateLimiter, register)

router.use(authMiddleware);
router.delete("/logout", logout);

export default router;  