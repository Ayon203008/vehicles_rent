import { Request, Response } from "express"
import { pool } from "../../config/db"
import bcrypt from "bcryptjs";

const GetAllUser = async () => {
    const result = await pool.query(`SELECT * FROM users`)
    return result
}

const DeleteUserData  = async (userId: string) => {

    const activeBookingCheck = await pool.query(
        `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
        [userId]
    );

    if (activeBookingCheck.rowCount !== null && activeBookingCheck.rowCount > 0) {
        throw new Error("ACTIVE_BOOKING_EXISTS");
    }


    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING *`, 
        [userId]
    );

    if (result.rowCount === 0) {
        throw new Error("USER_NOT_FOUND");
    }

    return result.rows[0];
}


const UpdateUserData = async (targetUserId: number, loggedInUser: any, payload: any) => {
    const { name, email, password, phone, role } = payload;


    if (loggedInUser.role !== "admin" && loggedInUser.id !== targetUserId) {
        throw new Error("FORBIDDEN");
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

    if (result.rowCount === 0) {
        throw new Error("USER_NOT_FOUND");
    }

    
    const updatedUser = result.rows[0];
    delete updatedUser.password;
    
    return updatedUser;
};


export const UserServices= {
    GetAllUser,
    DeleteUserData,
    UpdateUserData
}