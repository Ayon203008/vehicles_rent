import { Request, Response } from "express"
import { pool } from "../../config/db"

const PostVehicles = async (vehicle_name: string, type: string, registration_number: string, daily_rent_price: number, availability_status: string) => {
    const result = await pool.query(`INSERT INTO vehicles (vehicle_name,type,registration_number, daily_rent_price,availability_status) VALUES($1,$2,$3,$4,$5) RETURNING * `, [vehicle_name, type, registration_number, daily_rent_price, availability_status])
    return result
}


const GetALlVehicles = async () => {
    const result = await pool.query(`SELECT * FROM vehicles`)
    return result

}


const GetSingleVehicle = async (vehicleId: string) => {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [
        vehicleId
    ])
    return result
}



const UpdateVehicle = async (vehicle_name: string, type: string, daily_rent_price: number, availability_status: string, vehicleId: string) => {
    const result = await pool.query(`UPDATE vehicles SET vehicle_name=$1, type=$2,  daily_rent_price=$3, availability_status=$4 WHERE id=$5 RETURNING *`, [
        vehicle_name, type, daily_rent_price, availability_status, vehicleId
    ])
    return result;

}


const DeleteVehicles = async (vehicleId: string) => {
    const result = await pool.query(`DELETE FROM vehicles WHERE id=$1`, [
        vehicleId
    ])
    return result
}


export const VechileServices = {
    PostVehicles,
    GetALlVehicles,
    GetSingleVehicle,
    UpdateVehicle,
    DeleteVehicles
}