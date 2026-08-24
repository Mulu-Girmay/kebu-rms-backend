import { Server } from "socket.io";
import { SOCKET_EVENTS } from "./events.js";
import { KITCHEN_ROOM, userRoom } from "./rooms.js";
import { socketManager } from "./manager.js";

export const registerSockethandlers = (io:Server): void  => {
    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        const userId = socket.data.userId;

        socketManager.addUserSocket(userId, socket.id);
        socket.join(userRoom(userId));

        socket.on(
            SOCKET_EVENTS.ROOM_JOIN, async (room: string) => {
                // Authorizaion for rooms will be added here.
            if (room === KITCHEN_ROOM || room === userRoom(userId)) {
                socketManager.joinRoom(socket, room);
                }
            }
        );

        socket.on(SOCKET_EVENTS.ROOM_LEAVE, (room: string) => {
         socketManager.leavRoom(socket, room)
        });
        
        socket.on(SOCKET_EVENTS.DISCONNECT,() => {
            socketManager.removeUserSocket(socket.id);
        })
     }
    );
    
}