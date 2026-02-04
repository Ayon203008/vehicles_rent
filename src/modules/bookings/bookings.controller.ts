import { Request, Response } from "express";
import { pool } from "../../config/db";

const GetBookings = async (req: Request, res: Response) => {
    const loggedInUser = (req as any).user
    try {
        if (loggedInUser === 'admin') {
            const result = await pool.query(`SELECT * FROM bookings`)
            res.send(200).json({
                success: true,
                message: "All bookings get successfully",
                data: result.rows[0]
            })
        }
        else {
            const result = await pool.query(`SELECT * FROM bookings WHERE user_id = $1`, [loggedInUser.id]);
              res.send(200).json({
                success: true,
                message: "Bookings get successfully",
                data: result.rows[0]
            })
        }
    } catch (err: any) {
        res.send(500).json({
            success: false,
            message: err.message
        })
    }
}


export const BookingController = {
    GetBookings
}