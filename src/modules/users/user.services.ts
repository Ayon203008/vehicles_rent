import { Request, Response } from "express"
import { pool } from "../../config/db"

const GetAllUser = async () => {
    const result = await pool.query(`SELECT * FROM users`)
    return result
}





export const UserServices= {
    GetAllUser
}