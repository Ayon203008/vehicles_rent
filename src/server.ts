import express, { Request, Response } from 'express'
const app = express()
import { Pool } from 'pg'
import config from './config'
import { initDB, pool } from './config/db'
const port = config.port

import bcrypt from "bcryptjs"
import { authRoutes } from './modules/auth/auth.routes'
import { VehiclesRouter } from './modules/vehicles/vehicles.routes'
import { UserRouter } from './modules/users/users.routes'
import { BookingRouter } from './modules/bookings/bookings.route'
import auth from './middleware/auth'


app.use(express.json())

initDB()

app.use("/api/v1/auth", authRoutes)

app.use("/api/v1", VehiclesRouter)

app.use("/api/v1", UserRouter)

app.use("/api/v1", BookingRouter)




app.delete("/api/v1/users/:userId", async (req: Request, res: Response) => {
    try {
        const activeBookingCheck = await pool.query(
            `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
            [req.params.userId]
        );

        if (activeBookingCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete user. User has an active booking."
            });
        }

        const result = await pool.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [
            req.params.userId
        ])

        if (result.rows.length === 0) {
            res.status(404).json({
                message: "User not found",
                success: false
            })
        } else {
            res.status(200).json({
                message: "User get successfully",
                data: result.rows[0]
            })
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})




app.put("/api/v1/users/:userId", auth("admin", "user"), async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // logged-in user from auth middleware
        const loggedInUser = (req as any).user;

        // Target user ID from URL (convert to number)
        const targetUserId = Number(req.params.userId);

        // Debugging logs
        console.log("Logged-in User:", loggedInUser);
        console.log("Target UserId:", targetUserId);

        if (!loggedInUser) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Authorization check
        if (loggedInUser.role !== "admin" && loggedInUser.id !== targetUserId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own profile"
            });
        }

        // Hash password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        let result;

        if (loggedInUser.role === "admin") {
            // Admin can update any user + role
            result = await pool.query(
                `UPDATE users 
                 SET name=$1, email=$2, password=COALESCE($3, password), phone=$4, role=COALESCE($5, role)
                 WHERE id=$6 RETURNING *`,
                [name, email, hashedPassword, phone, role, targetUserId]
            );
        } else {
            // Customer can update only own profile, cannot change role
            result = await pool.query(
                `UPDATE users 
                 SET name=$1, email=$2, password=COALESCE($3, password), phone=$4
                 WHERE id=$5 RETURNING *`,
                [name, email, hashedPassword, phone, targetUserId]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Remove password before sending response
        delete result.rows[0].password;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0]
        });

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});


app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path
    })
})


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})




// * ! Delete users(Not completed yet first create the bookings then try )









// *Create booking with start/end dates
// • Validates vehicle availability
// • Calculates total price (daily rate × duration)
// • Updates vehicle status to "booked"

// * POST THE BOOKINGS

// app.post("/api/v1/bookings", async (req: Request, res: Response) => {

//     const {  } = req.body
//     try {
//         const result = await pool.query(``)
//         res.status(200).json({
//             success: true,
//             data: result.rows[0]
//         })
//     } catch (err: any) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }
// })








// not found route


