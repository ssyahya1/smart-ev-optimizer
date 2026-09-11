import pool from "../config/database.js";
import {z} from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

export const registerUser = async(req,res,next)=>{
    
    try{
    const{
        name,email,password
    } = req.body;

    const result = registerSchema.safeParse({
        name,
        email,
        password,
});
     if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: result.error
            });
        }

    const existingUser = await pool.query(
        `select id from users WHERE email = $1`,
        [email]
    );
    
    if(existingUser.rows.length > 0){
        return res.status(409).json({
            message: "User already exists",

        });
    }
    const hashedPassword = await bcrypt.hash(
        password,
        10
    )
    const addUser = await pool.query(
            `
            INSERT INTO users
                (name, email, password_hash )
            VALUES
                ($1, $2, $3)
            RETURNING
                id,
                name,
                email,
                role,
                created_at
            `,
            [
                name,
                email,
                hashedPassword,
                
            ]
        );

        
        res.status(201).json({
            message:
                "User created successfully",
            user: addUser.rows[0]
        });
}
catch(error){
    next(error);
} 
};

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
});

export const loginUser = async(req,res,next)=>{
    try{
    const{
        email,password
    } = req.body;

    const result = loginSchema.safeParse({
        email,
        password,
});

        
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid Email or password"
            });
        }

        const findUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (findUser.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = findUser.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }

        );
        res.cookie(
        process.env.COOKIE_NAME,
        token,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            path: "/",
            maxAge: 15 * 60 * 1000
        }
    );
        
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            
        });

    } catch (error) {
        next(error);
    }
};

export const logoutUser = async(req,res,next)=>{
    res.clearCookie(process.env.COOKIE_NAME);
    
        return res.status(200).json({
            message:"Successfully Logout"
        })
    }


export const createAdmin = async(req,res,next)=>{

    
    try{
    const{
        name,email,password
    } = req.body;
     const result = registerSchema.safeParse({
        name,
        email,
        password,
});

     if (!result.success) {
            return res.status(400).json({
                message: "Validation Failed",
                error: result.error
            });
        }

    const existingUser = await pool.query(
        `select id from users WHERE email = $1`,
        [email]
    );
    
    if(existingUser.rows.length > 0){
        return res.status(409).json({
            message: "User already exists",

        });
    }
    const hashedPassword = await bcrypt.hash(
        password,
        10
    )

    const addAdmin = await pool.query(
            `
            INSERT INTO users
                (name, email, password_hash,role )
            VALUES
                ($1, $2, $3,$4)
            RETURNING
                id,
                name,
                email,
                role,
                created_at
            `,
            [
                name,
                email,
                hashedPassword,
                "admin"
                
            ]
        );

        
        res.status(201).json({
            message:
                "User created successfully",
            user: addAdmin.rows[0]
        });
}
catch(error){
    next(error);
} 
};