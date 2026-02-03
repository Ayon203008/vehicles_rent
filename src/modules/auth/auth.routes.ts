import { Router } from "express";
import { AuthController } from "./auth.controller";


const router = Router()

router.post("/signup", AuthController.SignUpUser)

router.post("/signin",  AuthController.signInUser)


export const authRoutes = router