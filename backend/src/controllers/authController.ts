import type { Request, Response } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: "User created!" });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req : Request, res : Response) => {
    try{
        const { username,password} = req.body;
        const user = await User.findOne({username});

        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(401).json({message : "Access Denied"});
        }

        const token = jwt.sign({id : user._id} , process.env.JWT_SECRET!, {expiresIn : '30d'});
        res.json({token});
        
    } catch (error : any) {
        res.status(500).json({error : error.message});
    }
}