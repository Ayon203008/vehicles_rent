
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
            const decode = jwt.verify(token, config.jwtsecret as string) as JwtPayload
            console.log({ decode })
            req.user=decode 

             if (roles.length && !roles.includes(decode.role)) {
                return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
            }

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