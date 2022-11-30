import { io } from "socket.io-client";
import { callbackify } from "util";

export class Socket {
	public socket;
	constructor() {
		const socket = io('ws://localhost:3000', {
			withCredentials: true,
		}); 
		this.socket = socket;
	}

	listenOn(listen: string, callback: any) {
		this.socket.on(listen, callback);
	}

	listenOff(listen: string) {
		this.socket.off(listen);
	}
}

export default Socket;
