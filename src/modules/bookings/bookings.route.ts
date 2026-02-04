import { Router } from "express";
import { BookingController } from "./bookings.controller";
import auth from "../../middleware/auth";

const router = Router()

router.get("/bookings",auth("admin","customer"),BookingController.GetBookings )

export const BookingRouter = router