import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router()

// admin only
router.get("/users",auth('admin'),UserController.GetAllUser)

// router.put("/users/:userId",)

export const UserRouter = router