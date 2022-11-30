import { Inject } from '@nestjs/common';
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
import { Server } from 'http';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';

class verifyUserDto {
	sub: number; /* user id */
	oauthID: string; /* Parent ID */
}


class UserSocket {
  userID: number;
  socketID: string;
}



@WebSocketGateway({
	cors: {
		origin: [
			'http://localhost:3006',
		],
		credentials: true,
	},
	// namespace: 'chat',
	// transports: ['websocket'],
})
export class socketGateway {
	constructor (
		@Inject('AUTH_SERVICE') private readonly authService: AuthService,
	) {
		console.log("socket Gateway constructor");
	}

	@WebSocketServer()
	server: Server;

	/* List of current users */
	connections: UserSocket[] = [];

	async handleConnection (client: any, ...args: any[]) {
		console.log('client connected', client.id);
		const user = await this.findUser(client)
		console.log('user', user);
		if (user) {
			this.connections.push({
				userID: user.sub,
				socketID: client.id,
			});
		}
		console.log('Connections', this.connections);
	}

	async handleDisconnect (client: any) {
		console.log('client disconnected', client.id);
		const user = await this.findUser(client)
		this.connections = this.connections.filter((connection) => {
			return connection.userID !== user?.sub;
		});
		console.log('Connections', this.connections);
	}















	/* Chats */
	@SubscribeMessage('chat/join')
	async handleJoinChat (client: any, payload: any) {
		console.log('join chat', payload);
		// const user = await this.findUser(client)
		// console.log('user', user);
		// client.join(payload.chatID);
		// client.emit('chat/join', {
		// 	chatID: payload.chatID,
		// 	userID: user.sub,
		// });
	}

	@SubscribeMessage('chat/leave')
	async handleLeaveChat (client: any, payload: any) {
		console.log('leave chat', payload);
		// client.to 
		// const user = await this.findUser(client)
		// console.log('user', user);
		// client.leave(payload.chatID);
		// client.emit('chat/leave', {
		// 	chatID: payload.chatID,
		// 	userID: user.sub,
		// });
	}

	// @SubscribeMessage('chat/new-chat')
	async emitNewChat (client: any, payload: any) {
	}

	async emitNewMessage(socket: Socket, payload: any) {
		console.log('emit new message', payload);
		// socket.to(payload.chatID).emit('chat/new-message', payload);
		// this.server.to(chatID.toString()).emit('chat/new-message', message);
	}





	private parseCookies (cookies: string) {
		const list = {};
		cookies && cookies.split(';').forEach((cookie) => {
			const parts = cookie.split('=');
			list[parts.shift().trim()] = decodeURI(parts.join('='));
		});
		return list;
	}

	private async findUser (client: any): Promise<verifyUserDto> {
		const cookies = this.parseCookies(client.handshake.headers.cookie);
		const user = await this.authService.verifyJWT(cookies['jwt'])
		return user;
	}
}