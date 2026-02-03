import { Router } from "express";
import { VechilesController } from "./vehicles.controller";
import auth from "../../middleware/auth";

const router = Router()

// only admin
router.post("/vehicles",auth('admin'),VechilesController.PostVehicles)

// public
router.get("/vehicles",VechilesController.GetAllVehicles)

//public
router.get("/vehicles/:vehicleId",VechilesController.GetSingleVehicle)

// admin only
router.delete("/vehicles/:vehicleId",auth('admin'),VechilesController.DeleteVehicles)

// admin only
router.put("/vehicles/:vehicleId",auth('admin'),VechilesController.UpdateVehicle)


export const VehiclesRouter=router ;