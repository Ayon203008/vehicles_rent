import { Pool } from "pg";
import config from ".";

export const pool = new Pool({
    connectionString: `${config.connection_str}`
})


export const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(30),
        role VARCHAR(15) NOT NULL DEFAULT 'customer'
        )`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS  vehicles(
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
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
  `);
};
