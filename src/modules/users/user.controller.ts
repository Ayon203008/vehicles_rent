import { Request, Response } from "express"
import { pool } from "../../config/db"
import { UserServices } from "./user.services"
import bcrypt from "bcryptjs"


const GetAllUser =  async (req: Request, res: Response) => {
    try {
        const result = await UserServices.GetAllUser()
        res.status(200).json({
            success: true,
            data: result.rows
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const UpdateUserData = async (req: Request, res: Response) => {
    try {
        const targetUserId = Number(req.params.userId);
        const loggedInUser = (req as any).user;

        if (!loggedInUser) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const result = await UserServices.UpdateUserData(targetUserId, loggedInUser, req.body);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result
        });

    } catch (err: any) {
        let status = 500;
        let message = err.message;

        if (err.message === "FORBIDDEN") {
            status = 403;
            message = "You can only update your own profile";
        } else if (err.message === "USER_NOT_FOUND") {
            status = 404;
            message = "User not found";
        }

        res.status(status).json({
            success: false,
            message: message
        });
    }
};
const DeleteUserData = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const result = await UserServices.DeleteUserData(userId as string);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: result
        });
    } catch (err: any) {
        let status = 500;
        let message = err.message;

        if (err.message === "ACTIVE_BOOKING_EXISTS") {
            status = 400;
            message = "Cannot delete user. User has an active booking.";
        } else if (err.message === "USER_NOT_FOUND") {
            status = 404;
            message = "User not found";
        }

        res.status(status).json({
            success: false,
            message: message
        });
    }
};


export const UserController ={
    GetAllUser,
    UpdateUserData,
    DeleteUserData
}