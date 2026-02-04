import express, { Request, Response } from 'express'
const app = express()
import config from './config'
import { initDB, pool } from './config/db'
const port = config.port
import { authRoutes } from './modules/auth/auth.routes'
import { VehiclesRouter } from './modules/vehicles/vehicles.routes'
import { UserRouter } from './modules/users/users.routes'
import { BookingRouter } from './modules/bookings/bookings.route'

app.use(express.json())

initDB()

app.use("/api/v1/auth", authRoutes)

app.use("/api/v1", VehiclesRouter)

app.use("/api/v1", UserRouter)

app.use("/api/v1", BookingRouter)

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












