import { Prisma, User } from "../generated/prisma";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userExists = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    return !!user;
};

export const registerUser = async (user: Prisma.UserCreateInput): Promise<User> => {

    const exists = await userExists(user.email);
    if (exists) {
        throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);



    const newUser = await prisma.user.create({
        data: {
            ...user,
            password: hashedPassword,
        }
    });

    return newUser;
};

export const loginUser = async (email: string, password: string): Promise<Pick<User, "email" | "username" | "role"> & { token: string }> => {

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        omit: {
            password: false,
        }
    });
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new AppError("Invalid email or password", 401);
    }

    const { username, role } = user;

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
    });

    return {
        username,
        role,
        email,
        token,
    };
};


//https://www.rbxactive.com/products/everyday-ribbed-ankle-pant?variant=44076417417338&__orly_pdpOutfit=enabled&__orly_origin=qa-bento-dev