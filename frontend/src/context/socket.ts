import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socket = io('ws://' + process.env.HOST + ':3000', { withCredentials: true, });
export const SocketContext = createContext<Socket>(socket);