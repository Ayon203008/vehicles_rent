import { Router } from "express";
import { BookingController } from "./bookings.controller";
import auth from "../../middleware/auth";

const router = Router()

router.get("/bookings",auth("admin","customer"),BookingController.GetBookings )

router.post("/bookings", auth('admin', 'customer'),BookingController.createBookings)

router.put("/bookings/:bookingId",BookingController.UpdateBookings)

export const BookingRouter = router