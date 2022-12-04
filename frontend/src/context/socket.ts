import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socket = io('ws://localhost:3000', { withCredentials: true, });
export const SocketContext = createContext<Socket>(socket);