import { Router } from "express";
import { test } from "../controllers/userController";

const router = Router();

router.get("/test", test);

export default router;