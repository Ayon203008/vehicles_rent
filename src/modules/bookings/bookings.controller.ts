import { Request, Response } from "express";
import { pool } from "../../config/db";
import { BookingServices } from "./bookings.services";


const createBookings = async (req: Request, res: Response) => {
    try {
        const { vehicle_id, rent_start_date, rent_end_date } = req.body;
        const customer_id = (req as any).user.id;

        const result = await BookingServices.createBookings({
            vehicle_id,
            rent_start_date,
            rent_end_date,
            customer_id
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result
        });

    } catch (err: any) {
        let status = 500;
        let message = err.message;

        if (err.message === "VEHICLE_NOT_FOUND") {
            status = 404;
            message = "Vehicle not found";
        } else if (err.message === "VEHICLE_ALREADY_BOOKED") {
            status = 400;
            message = "Vehicle is already booked";
        } else if (err.message === "INVALID_DURATION") {
            status = 400;
            message = "End date must be after start date";
        }

        res.status(status).json({
            success: false,
            message: message
        });
    }
};

const GetBookings = async (req: Request, res: Response) => {
    const loggedInUser = (req as any).user;

    try {
        const bookings = await BookingServices.GetBookings(loggedInUser.role, loggedInUser.id);

        res.status(200).json({
            success: true,
            message: loggedInUser.role === 'admin'
                ? "All bookings retrieved successfully"
                : "Your bookings retrieved successfully",
            data: bookings
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const UpdateBookings = async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const loggedInUser = (req as any).user;

    try {
        const result = await BookingServices.UpdateBookings(bookingId as string, loggedInUser);
        
        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (err: any) {
        let status = 500;
        let message = err.message;

        if (err.message === "NOT_FOUND") {
            status = 404;
            message = "Booking not found";
        } else if (err.message === "UNAUTHORIZED") {
            status = 403;
            message = "Unauthorized to update this booking";
        } else if (err.message === "CANNOT_CANCEL_AFTER_START") {
            status = 400;
            message = "Cannot cancel booking after start date";
        }

        res.status(status).json({
            success: false,
            message: message
        });
    }
};




export const BookingController = {
    GetBookings,
    createBookings,
    UpdateBookings
}