import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import {config} from '../config/environments.js'
import type { Response } from 'express';

export const generateAccessToken = ( res:Response, id:any, username:string, email:string) =>{
    const accessToken:string = jwt.sign({
        id, username, email}, config.jwt.secret, {expiresIn: "1d"} )
    
        res.cookie('accessToken', accessToken,{
            httpOnly:true,
            secure:false,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
            path: '/'
        })
    };

export const generateRefreshToken = ( res:Response, id:any, username:string, email:string) =>{
    const refreshToken:string = jwt.sign({
        id, username, email}, config.jwt.secret, {expiresIn: "1d"} )
    
    res.cookie('refreshToken', refreshToken, {
            httpOnly:true,
            secure:false,
            sameSite: 'lax',
            maxAge: 1 * 24 * 60 * 60 * 1000,
            path: '/'        })
    };


    