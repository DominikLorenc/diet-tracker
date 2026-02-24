import { Request, Response } from "express";


export const test = (req: Request, res: Response) => {
    return res.json({ message: "działa" })
}


