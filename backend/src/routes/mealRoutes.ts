import { Router } from "express";
import { test } from "../controllers/userController";

const router = Router();

router.post("/test", test);

export default router;