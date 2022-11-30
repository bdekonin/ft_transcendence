import { Inject } from '@nestjs/common';
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { Server } from 'socket.io';
import { MessageDto } from 'src/chat/message.dto';
import { ChatService } from 'src/chat/chat.service';

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
		private readonly chatService: ChatService,
	) {
		console.log("socket Gateway constructor");
	}

	@WebSocketServer()
	server: Server;

	/* List of current users */
	connections: UserSocket[] = [];

	async handleConnection (client: any, ...args: any[]) {
		const user = await this.findUser(client)
		if (user) {
			this.connections.push({
				userID: user.sub,
				socketID: client.id,
			});
		}
		console.log('Connections', this.connections);
	}

	async handleDisconnect (client: any) {
		const user = await this.findUser(client)
		this.connections = this.connections.filter((connection) => {
			return connection.userID !== user?.sub;
		});
		console.log('Connections', this.connections);
	}















	/* Chats */
	@SubscribeMessage('chat/join-one')
	async handleJoinChatOne (client: any, payload: any) {
		console.log('join chat', payload);
		// const user = await this.findUser(client)
		// console.log('user', user);
		// client.join(payload.chatID);
		// client.emit('chat/join', {
		// 	chatID: payload.chatID,
		// 	userID: user.sub,
		// });
	}

	@SubscribeMessage('chat/join-multiple')
	async handleJoinChatMultiple (client: any, payload: any) {
		// console.log('join chat', payload);
		const user = await this.findUser(client)
		// console.log('user', user);
		payload.chatIDs.forEach((chatID: string) => {
			client.join('chat:' + chatID);
			console.log('Joining chat: ', chatID);
		});
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
	
	@SubscribeMessage('chat/new-chat')
	async emitNewChatMessage(client: any, payload: MessageDto) {
		const userID = this.connections.find((connection) => {
			return connection.socketID === client.id;
		})?.userID;
		this.chatService.sendMessage(payload.chatID, userID, payload.message);
		console.log('emit chat:', payload.chatID , payload);
		this.server.to('chat:' + payload.chatID).emit('chat/new-message', payload);
	}




	async pong() {
		console.log('Pong has been called!');
		this.server.emit('pong');
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