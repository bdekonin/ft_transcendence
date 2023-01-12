import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { hostname } from "./host";

export const socket = io('ws://' + hostname + ':3000', { withCredentials: true, });
export const SocketContext = createContext<Socket>(socket);