import { Request, Response } from "express"
import { pool } from "../../config/db"
import { UserServices } from "./user.services"

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

// const UpdateUser=async()=>{
    
// }



export const UserController ={
    GetAllUser
}