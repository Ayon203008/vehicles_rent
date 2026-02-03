import express, { Request, Response } from 'express'
const app = express()
import { Pool } from 'pg'
import config from './config'
import { initDB, pool } from './config/db'
const port = config.port

import bcrypt from "bcryptjs"
import { authRoutes } from './modules/auth/auth.routes'
import { VehiclesRouter } from './modules/vehicles/vehicles.routes'


app.use(express.json())

initDB()

app.use("/api/v1/auth",authRoutes)

app.use("/api/v1",VehiclesRouter)



// * Get all users 

app.get("/api/v1/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users`)
        res.status(200).json({
            success: true,
            data: result.rows
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})



app.use((req:Request,res:Response)=>{
    res.status(404).json({
        success:false,
        message:"Route not found",
        path:req.path
    })
})


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


// * Get all users 

// app.get("/api/v1/users", async (req: Request, res: Response) => {
//     try {
//         const result = await pool.query(`SELECT * FROM users`)
//         res.status(200).json({
//             success: true,
//             data: result.rows
//         })
//     } catch (err: any) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }
// })

// * ! Delete users(Not completed yet first create the bookings then try )

// app.delete("/api/v1/users/:userId", async (req: Request, res: Response) => {
//     try {
//         const activeBookingCheck = await pool.query(
//             `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
//             [ req.params.userId]
//         );

//         if (activeBookingCheck.rows.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Cannot delete user. User has an active booking."
//             });
//         }

//         const result = await pool.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [
//            req.params.userId
//         ])

//         if(result.rows.length===0){
//             res.status(404).json({
//                 message:"User not found",
//                 success:false
//             })
//         }else{
//             res.status(200).json({
//                 message:"User get successfully",
//                 data:result.rows[0]
//             })
//         }

//     } catch (err: any) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }
// })




// app.put("/api/v1/users/:userId", async (req: Request, res: Response) => {

//      const {name,email,password,phone  } = req.body

//     try {
//         const result = await pool.query(`UPDATE users SET name=$1,email=$2,password=$3,phone=$4 WHERE id=$5 RETURNING *`,[
//             name,email,password,phone,req.params.userId
//         ])

//         if(result.rows.length===0){
//             res.status(404).json({
//                 message:"User not found",
//                 success:false
//             })
//         }else{
//             res.status(200).json({
//                 success:true,
//                 message:"User updated successfully",
//                 data:result.rows[0]
//             })
//         }

//     } catch (err: any) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }
// })





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




// * GET ALL THE BOOKINGS
// app.get("/api/v1/bookings",async(req:Request,res:Response)=>{
//     try{

//         const result = await pool.query(`SELECT * FROM bookings`)
//          res.send(500).json({
//             success:true,
//             message:"All bookings get successfully",
//             data:result.rows[0]
//         })

//     }catch(err:any){
//         res.send(500).json({
//             success:false,
//             message:err.message
//         })
//     }
// })




// not found route


