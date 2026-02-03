
import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from "../config"
const auth = (...roles:string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization
            console.log({ authToken: token })
            if (!token) {
                throw new Error("You are unauthorized")
            }
            const decode = jwt.verify(token, config.jwtsecret as string)
            console.log({ decode })
            req.user=decode as JwtPayload

            next()
        } catch (err: any) {
            res.status(500).json({
                success: false,
                message: err.message
            })
        }
    }
}
export default auth