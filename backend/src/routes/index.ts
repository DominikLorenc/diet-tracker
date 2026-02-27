import { Router } from "express";
import userRoutes from "./userRoutes";
import mealRoutes from "./mealRoutes";

const router = Router();

router.use("/users", userRoutes);
router.use("/meals", mealRoutes);


export default router;


