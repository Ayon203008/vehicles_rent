import { Request, Response } from "express"
import { authServices } from "./auth.services"
import { pool } from "../../config/db"
import bcrypt from "bcryptjs"

const signInUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const result = await authServices.SignInUser(email, password)
    if (result === null) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
    if (result === false) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      })
    }
    res.status(200).json({
      success: true,
      message: "Sign in successfully",
      data: result
    })

  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}


const SignUpUser = async (req: Request, res: Response) => {
        const { name, email, password, phone, role } = req.body
        const hashedPassword = await bcrypt.hash(password as string, 10)

        // * password hashed using bcrypt

        try {
            const result = await authServices.SignUpUser(name, email, hashedPassword, phone, role)
            res.status(201).json({
                "message": "User Registrated successfully",
                success: true,
                data: result.rows[0]

            })

        } catch (err: any) {
            res.status(500).json({
                success: false,
                error: err.message
            })
        }
    }

    export const AuthController = {
        signInUser,
        SignUpUser
    }