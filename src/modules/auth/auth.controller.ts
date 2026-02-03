import { Request, Response } from "express"
import { authServices } from "./auth.services"

const loginUser = async(req:Request,res:Response)=>{

    const {email,password}=req.body

    try{
        const result = await authServices.SignInUser(email,password)
        res.status(200).json({
            success:true,
            message:"Sigin successfully",
            data:result
        })

    }catch(err:any){
        res.status(500).json({
            success:false,
            message:err.message
        })
    }
}