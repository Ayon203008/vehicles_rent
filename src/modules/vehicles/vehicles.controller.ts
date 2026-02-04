import { Request, Response } from "express"
import { pool } from "../../config/db"
import { VechileServices } from "./vehicles.services"

const PostVehicles = async (req: Request, res: Response) => {

    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body
    try {
        const result = await VechileServices.PostVehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status)
        res.status(200).json({
            success: true,
            data: result.rows[0]
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


const GetAllVehicles = async (req: Request, res: Response) => {
    try {
        const result = await VechileServices.GetALlVehicles()
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
}


const GetSingleVehicle = async (req: Request, res: Response) => {

    const { vehicleId } = req.params

    try {
        const result = await VechileServices.GetSingleVehicle(vehicleId as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                message: "Vehicles not found",
                success: false
            })
        } else {
            res.status(200).json({
                message: "Vehicles get successfully",
                data: result.rows[0]
            })
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

const UpdateVehicle = async (req: Request, res: Response) => {

    const {vehicleId}=req.params
    const { vehicle_name, type, daily_rent_price, availability_status } = req.body

    try {
        const result = await VechileServices.UpdateVehicle(vehicle_name, type, daily_rent_price, availability_status, vehicleId as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                message: "Vehicles not found",
                success: false
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Vehicles updated successfully",
                data: result.rows[0]
            })
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


const DeleteVehicles = async (req: Request, res: Response) => {
    try {

        const { vehicleId } = req.params

        const result = await VechileServices.DeleteVehicles(vehicleId as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                message: "Vehicles not found",
                success: false
            })
        } else {
            res.status(200).json({
                message: "Vehicles Delete successfully",
                data: result.rows[0]
            })
        }

    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


export const VechilesController = {
    PostVehicles,
    GetAllVehicles,
    GetSingleVehicle,
    UpdateVehicle,
    DeleteVehicles
}