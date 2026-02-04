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


const UpdateUserData =async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const loggedInUser = (req as any).user;
        const targetUserId = Number(req.params.userId);
        console.log("Logged-in User:", loggedInUser);
        console.log("Target UserId:", targetUserId);

        if (!loggedInUser) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (loggedInUser.role !== "admin" && loggedInUser.id !== targetUserId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own profile"
            });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        let result;
        if (loggedInUser.role === "admin") {

            result = await pool.query(
                `UPDATE users 
                 SET name=$1, email=$2, password=COALESCE($3, password), phone=$4, role=COALESCE($5, role)
                 WHERE id=$6 RETURNING *`,
                [name, email, hashedPassword, phone, role, targetUserId]
            );
        } else {
            result = await pool.query(
                `UPDATE users 
                 SET name=$1, email=$2, password=COALESCE($3, password), phone=$4
                 WHERE id=$5 RETURNING *`,
                [name, email, hashedPassword, phone, targetUserId]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        delete result.rows[0].password;
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const DeleteUserData = async (req: Request, res: Response) => {
    try {
        const activeBookingCheck = await pool.query(
            `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
            [req.params.userId]
        );

        if (activeBookingCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete user. User has an active booking."
            });
        }

        const result = await pool.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [
            req.params.userId
        ])

        if (result.rows.length === 0) {
            res.status(404).json({
                message: "User not found",
                success: false
            })
        } else {
            res.status(200).json({
                message: "User get successfully",
                data: result.rows[0]
            })
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


export const UserController ={
    GetAllUser,
    UpdateUserData,
    DeleteUserData
}