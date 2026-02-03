import { pool } from "../../config/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import config from "../../config"


const SignInUser = async (email: string, password: string) => {
    const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email])
    if (result.rows.length === 0) {
        return null
    }
    const user = result.rows[0]
    const match =await bcrypt.compare(password, user.password)
    if (!match) {
        return false
    }
  
    const token = jwt.sign({
        name: user.name,
        email: user.email
    }, config.jwtsecret as string, {
        expiresIn: "7d"
    })
    console.log({ token })
    return { token, user }
}




const SignUpUser = async (name: string, email: string, hashedPassword: string, phone: string, role: string) => {
    const result = await pool.query(`INSERT INTO users(name,email,password,phone,role) VALUES($1,$2,$3,$4,$5) RETURNING *`, [name, email, hashedPassword, phone, role])
    return result
}

export const authServices = {
    SignInUser,
    SignUpUser
}