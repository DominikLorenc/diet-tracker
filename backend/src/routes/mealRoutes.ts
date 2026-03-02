import { Router, Request, Response } from "express";


const router = Router();

router.post("/meal", (req: Request, res: Response) => {
    return res.status(200).json({ message: "Meal created" });
});

export default router;