import { Inject } from '@nestjs/common';
import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from 'src/chat/message.dto';
import { ChatService } from 'src/chat/chat.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Chat } from 'src/entities/Chat.entity';

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

	async handleConnection (client: Socket, ...args: any[]) {
		const user = await this.findUser(client)
		const rooms = await this.fetchRooms(client); /* Currently joined rooms */
		if (user) {
			this.connections.push({
				userID: user.sub,
				socketID: client.id,
			});
		}
		console.log('Connections', this.connections);

		console.log();
	}

	async handleDisconnect (client: Socket) {
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
	}

	@SubscribeMessage('chat/join-multiple')
	async handleJoinChatMultiple (client: Socket, payload: any) {
		// console.log('join chat', payload);
		const user = await this.findUser(client)
		// console.log('user', user);
		payload.chatIDs.forEach((chatID: string) => {
			console.log('client ' + client.id + ' joining chat ' + chatID);
			client.join('chat:' + chatID);
		});
	}

	@SubscribeMessage('chat/leave')
	async handleLeaveChat (client: Socket, payload: any) {
		console.log('leave chat', payload);
	}
	
	@SubscribeMessage('chat/new-chat')
	async emitNewChatMessage(client: Socket, payload: MessageDto) {
		console.log('Recieved emit', new Date().valueOf().toString());
		const userID = this.connections.find((connection) => {
			return connection.socketID === client.id;
		})?.userID;
		if (userID != payload.senderID) {
			console.log('User ID does not match sender ID');
			return;
		}
		const messagePayload = await this.chatService.sendMessage(payload.chatID, userID, payload.message);
		this.server.in('chat:' + payload.chatID).emit('chat/new-message', messagePayload);
	}



	private async fetchRooms (client: Socket): Promise<Chat[]> {
		const user = await this.findUser(client)
		const rooms = await this.chatService.getChats(user.sub, "joined");
		return rooms;
	}
	private parseCookies (cookies: string) {
		const list = {};
		cookies && cookies.split(';').forEach((cookie) => {
			const parts = cookie.split('=');
			list[parts.shift().trim()] = decodeURI(parts.join('='));
		});
		return list;
	}

	private async findUser (client: Socket): Promise<verifyUserDto> {
		const cookies = this.parseCookies(client.handshake.headers.cookie);
		const user = await this.authService.verifyJWT(cookies['jwt'])
		return user;
	}
}