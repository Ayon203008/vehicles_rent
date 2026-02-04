import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router()

// admin only
router.get("/users",auth('admin'),UserController.GetAllUser)

router.put("/users/:userId",auth("admin","customer"),UserController.UpdateUserData)

router.delete("/users/:userId",auth("admin"),UserController.DeleteUserData)

export const UserRouter = router