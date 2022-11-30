import { io } from "socket.io-client";

export class Socket {
	public socket;
	constructor() {
		const socket = io('ws://localhost:3001', {
			withCredentials: true,
		});
		// socket.connect();
		this.socket = socket;
	}

	listenOn(listen: string) {
		this.socket.on(listen, (e) => {console.log(e)});
	}

	listenOff(listen: string) {
		this.socket.off(listen, () => {console.log('stopped listening on ' + listen)});
	}
}
