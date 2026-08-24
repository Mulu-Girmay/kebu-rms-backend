import { Server } from "socket.io";
import {type Server as HttpServer } from "node:http";
import { socketManager } from "./manager.js";
import { registerSockethandlers } from "./handler.js";
import { socketAuthMiddleware } from "./middleware.js";


export const initializeSocket = (server: HttpServer): Server => {
    const io = new Server(server, {
        cors: {
            origin: true, // replace with frontedn origin
            credentials: true,
        },
    });
    socketManager.initialize(io);
    // io.use(socketAuthMiddleware);  this Middlware will not work for now
                                        // it require a jwt verification utlity...
    registerSockethandlers(io);
    return io;
}