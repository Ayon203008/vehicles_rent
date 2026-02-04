import { pool } from "../../config/db";

const GetBookings = async (role: string, userId: number) => {
    if (role === 'admin') {
        const result = await pool.query(`SELECT * FROM bookings`);
        return result.rows;
    } else {
        const result = await pool.query(
            `SELECT * FROM bookings WHERE customer_id = $1`,
            [userId]
        );
        return result.rows;
    }
};



 const UpdateBookings = async (bookingId: string, loggedInUser: any) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get booking
        const bookingResult = await client.query(`SELECT * FROM bookings WHERE id = $1`, [bookingId]);
        if (bookingResult.rowCount === 0) {
            throw new Error("NOT_FOUND");
        }
        const booking = bookingResult.rows[0];

        let newStatus = '';

        if (loggedInUser.role === "customer") {
            // Permission check
            if (booking.customer_id !== loggedInUser.id) {
                throw new Error("UNAUTHORIZED");
            }
            // Date check
            if (new Date() >= new Date(booking.rent_start_date)) {
                throw new Error("CANNOT_CANCEL_AFTER_START");
            }
            newStatus = 'cancelled';
        } 
        else if (loggedInUser.role === "admin") {
            newStatus = 'returned';
        }

        // 2. Update Booking Status
        await client.query(
            `UPDATE bookings SET status = $1 WHERE id = $2`,
            [newStatus, bookingId]
        );

        // 3. Update Vehicle Availability
        await client.query(
            `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
            [booking.vehicle_id]
        );

        await client.query('COMMIT');
        return { message: loggedInUser.role === "admin" ? "Booking marked as returned" : "Booking cancelled successfully" };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};


const createBookings = async (payload: {
    vehicle_id: number,
    rent_start_date: string,
    rent_end_date: string,
    customer_id: number
}) => {
    const { vehicle_id, rent_start_date, rent_end_date, customer_id } = payload;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');


        const vehicleResult = await client.query(
            `SELECT daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
            [vehicle_id]
        );

        if (vehicleResult.rowCount === 0) {
            throw new Error("VEHICLE_NOT_FOUND");
        }

        const vehicle = vehicleResult.rows[0];

        if (vehicle.availability_status !== "available") {
            throw new Error("VEHICLE_ALREADY_BOOKED");
        }

   
        const startDate = new Date(rent_start_date);
        const endDate = new Date(rent_end_date);
        const diffTime = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            throw new Error("INVALID_DURATION");
        }

        const totalPrice = days * Number(vehicle.daily_rent_price);


        const bookingResult = await client.query(
            `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
        );

      
        await client.query(
            `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
            [vehicle_id]
        );

        await client.query('COMMIT');
        return bookingResult.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const BookingServices = {
    GetBookings,
    UpdateBookings,
    createBookings
}