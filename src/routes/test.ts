import express from 'express';
import type {Request, Response } from 'express'
const route = express.Router()

route.get('/', (req:Request, res:Response) => {
    res.json({message: 'Idea tracker API is up and running'})
})
 
export default route;