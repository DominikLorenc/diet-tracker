import { Router } from "express";
import { register, login, logout } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register)

router.use(authMiddleware);
router.delete("/logout", logout);

export default router;  