import { Request, Response } from "express";
import { pool } from "../../config/db";


const createBookings = async (req: Request, res: Response) => {
    const { vehicle_id, rent_start_date, rent_end_date } = req.body;
    const customer_id = (req as any).user.id;

    try {

        const vehicleResult = await pool.query(
            `SELECT daily_rent_price, availability_status
       FROM vehicles
       WHERE id = $1`,
            [vehicle_id]
        );

        if (vehicleResult.rowCount === 0) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        const vehicle = vehicleResult.rows[0];

        if (vehicle.availability_status !== "available") {
            return res.status(400).json({ message: "Vehicle already booked" });
        }


        const startDate = new Date(rent_start_date);
        const endDate = new Date(rent_end_date);

        const diffTime = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            return res.status(400).json({ message: "Invalid rental duration" });
        }


        const totalPrice = days * Number(vehicle.daily_rent_price);


        const bookingResult = await pool.query(
            `INSERT INTO bookings
       (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [
                customer_id,
                vehicle_id,
                rent_start_date,
                rent_end_date,
                totalPrice
            ]
        );

        // 5️⃣ Update vehicle status
        await pool.query(
            `UPDATE vehicles
       SET availability_status = 'booked'
       WHERE id = $1`,
            [vehicle_id]
        );

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: bookingResult.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


const GetBookings = async (req: Request, res: Response) => {
    const loggedInUser = (req as any).user
    try {
        if (loggedInUser.role === 'admin') {
            const result = await pool.query(`SELECT * FROM bookings`)
            res.status(200).json({
                success: true,
                message: "All bookings get successfully",
                data: result.rows
            })
        }
        else {
            const result = await pool.query(`SELECT * FROM bookings WHERE customer_id = $1`, [loggedInUser.id]);
              res.status(200).json({
                success: true,
                message: "Bookings get successfully",
                data: result.rows
            })
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


const UpdateBookings =  async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const loggedInUser = (req as any).user;

    try {

        const bookingResult = await pool.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [bookingId]
        );

        if (bookingResult.rowCount === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = bookingResult.rows[0];


        if (loggedInUser.role === "customer") {

            if (booking.customer_id !== loggedInUser.id) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const today = new Date();
            const startDate = new Date(booking.rent_start_date);

            if (today >= startDate) {
                return res.status(400).json({
                    message: "Cannot cancel booking after start date"
                });
            }

            await pool.query(
                `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
                [bookingId]
            );

            await pool.query(
                `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
                [booking.vehicle_id]
            );

            return res.status(200).json({
                success: true,
                message: "Booking cancelled successfully"
            });
        }

        if (loggedInUser.role === "admin") {

            await pool.query(
                `UPDATE bookings SET status = 'returned' WHERE id = $1`,
                [bookingId]
            );

            await pool.query(
                `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
                [booking.vehicle_id]
            );

            return res.status(200).json({
                success: true,
                message: "Booking marked as returned"
            });
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const BookingController = {
    GetBookings,
    createBookings,
    UpdateBookings
}