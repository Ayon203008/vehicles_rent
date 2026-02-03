import express, { Request, Response } from 'express'
const app = express()
import { Pool } from 'pg'
const port = 3000
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), ".env") })



app.use(express.json())
// neon db -->

//

const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STR}`
})



const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(15),
        role VARCHAR(15) NOT NULL DEFAULT 'customer'
        )`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS  vechiles(
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
        type VARCHAR(30) NOT NULL CHECK(type IN ('car','bike','van','SUV')),
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        daily_rent_price NUMERIC(10,2) NOT NULL CHECK(daily_rent_price>0),
        availability_status VARCHAR(50) NOT NULL DEFAULT 'available'
            CHECK (availability_status IN ('available', 'booked'))
        )
        `);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings(
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      vehicle_id INTEGER NOT NULL,
      rent_start_date DATE NOT NULL,
      rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
      total_price NUMERIC(10,2) NOT NULL CHECK(total_price>0),
      status VARCHAR(100) NOT NULL DEFAULT 'active'
        CHECK(status IN ('active','cancelled','returned')),
      CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id) REFERENCES users(id),
      CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vechiles(id)
    )
  `);
};

initDB()

// * register the users

app.post('/api/v1/auth/signup', async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body
    try {

        const result = await pool.query(`INSERT INTO users(name,email,password,phone,role) VALUES($1,$2,$3,$4,$5) RETURNING *`, [name, email, password, phone, role])
        res.status(200).json({
            success: true,
            data: result.rows[0]
        })


    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
})




app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
