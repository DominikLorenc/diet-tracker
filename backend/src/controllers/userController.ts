import { Request, Response } from "express";
import prisma from "../lib/prisma";


export const test = async (req: Request, res: Response) => {

    // console.log(req.body);

    const { email, username, password } = req.body;


    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(user);
        return res.json({ message: user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error" });
    }



}


