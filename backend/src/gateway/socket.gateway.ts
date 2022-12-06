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
import { Chat } from 'src/entities/Chat.entity';
import { UserService } from 'src/user/user.service';
import {v4 as uuidv4} from 'uuid';
import { seedrandom} from 'seedrandom';

class userDto {
	id: number; /* user id */
}


class UserSocket {
  userID?: number;
  socketID?: string;
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
		private readonly userService: UserService,
		private readonly chatService: ChatService,
	) {
		console.log("socket Gateway constructor");
	}

	@WebSocketServer()
	server: Server;

	/* List of current users */
	// connections: Set<number> = new Set();
	connections: UserSocket[] = [];


	async handleConnection (client: Socket, ...args: any[]) {
		const user = await this.findUser(client)
		if (!user)
			return;

		const rooms = await this.fetchRooms(client); /* Currently joined rooms */
		/* Add user to list of connections */
		this.connections.push({
			userID: user.id, socketID: client.id
		});


		/* Add client to every chat he is in */
		rooms.forEach((room) => {
			client.join('chat:' + room.id);
		});

		console.log('Connections', this.connections);
		console.log('Rooms', rooms);
	}

	async handleDisconnect (client: Socket) {
		const user = await this.findUser(client)

		/* This should never happen. But in case it happens we just return */
		if (!user)
			return;

		/* Remove user from list of connections */
		const clientToBeRemoved = this.connections.find((connection) => connection.socketID == client.id);
		if (clientToBeRemoved)
			this.connections.splice(this.connections.indexOf(clientToBeRemoved), 1);

		console.log('Connections', this.connections);
	}

	/* Chats */
	@SubscribeMessage('chat/join')
	async handleJoinChatMultiple (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		console.log('Join chat', payload);
		/* Add client to every chat he is in */
		client.join('chat:' + payload.chatID);
	}

	@SubscribeMessage('chat/leave')
	async handleLeaveChat (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		console.log('Leave chat', payload);
		client.leave('chat:' + payload.chatID);
	}
	
	@SubscribeMessage('chat/new-chat')
	async emitNewChatMessage(client: Socket, payload: MessageDto) {
		console.log('Recieved emit', new Date().valueOf().toString());
		const user = await this.findUser(client)
		if (!user)
			return;
	
		if (user.id != payload.senderID) {
			console.log('User ID does not match sender ID');
			return;
		}
		const messagePayload = await this.chatService.sendMessage(payload.chatID, user.id, payload.message);
		this.server.in('chat:' + payload.chatID).emit('chat/refresh-message', messagePayload);
	}

	@SubscribeMessage('ping')
	async handlePing (client: Socket, payload: Date) {
		const user = await this.findUser(client)
		if (!user)
			return;
		this.userService.updateUser(user.id, { lastOnline: new Date().valueOf().toString() });
	}



	private async fetchRooms (client: Socket): Promise<Chat[]> {
		const user = await this.findUser(client)
		if (!user)
			return null;
		const rooms = await this.chatService.getChats(user.id, "joined");
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

	private async findUser (client: Socket): Promise<userDto> {
		const cookies = this.parseCookies(client.handshake.headers.cookie);
		const user = await this.authService.verifyJWT(cookies['jwt'])
		if (!user)
			return null;

		if (!await this.authService.findUserById(user.id))
			return null;
		return { id: user.sub };
	}


	waitingPlayers: Set<string> = new Set();
	currentGames: Map<string, Game> = new Map();
	/* Game */

	@SubscribeMessage('game/waiting')
	async handleJoinGame (client: Socket, payload: any) {
		console.log('game/waiting has been called');
		const user = await this.findUser(client)
		if (!user)
			return;
		this.waitingPlayers.add(client.id);
		console.log('Waiting players', this.waitingPlayers);
		if (this.waitingPlayers.size >= 2) {
			this.createGame();
		}
	}

	@SubscribeMessage('game/leave')
	async handleLeaveGame (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		this.waitingPlayers.delete(client.id);
	}

	@SubscribeMessage('game/down')
	async handleDown (client: Socket, payload: any) {
		console.log('game/down has been called', payload);
		const user = await this.findUser(client)
		if (!user)
			return;
		if (payload.press == false)
			return;
		const game = this.currentGames.get(payload.id);
		if (!game) {
			console.log('game/down game not found', payload);
			return;
		}
		if (game.left.socket == client.id) {
			console.log('game/down left has been called');
			game.left.y += 8;
		} else if (game.right.socket == client.id) {
			console.log('game/down right has been called');
			game.right.y += 8;
		}
		// save game
		this.currentGames.set(payload, game);
		this.server.emit('game/update', game);
	}
	@SubscribeMessage('game/up')
	async handleUp (client: Socket, payload: any) {
		console.log('game/up has been called', payload);
		const user = await this.findUser(client)
		if (!user)
			return;
		if (payload.press == false)
			return;
		const game = this.currentGames.get(payload.id);
		if (!game) {
			console.log('game/up game not found', payload);
			return;
		}
		if (game.left.socket == client.id) {
			console.log('game/up left has been called');
			game.left.y -= 8;
		} else if (game.right.socket == client.id) {
			console.log('game/up right has been called');
			game.right.y -= 8;
		}
		// save game
		this.currentGames.set(payload, game);
		this.server.emit('game/update', game);
	}



	@SubscribeMessage('game/move')
	async handleMove (client: Socket, payload: any) {
		console.log('game/move has been called', payload);
		const user = await this.findUser(client)
		if (!user)
			return;
		const game = this.currentGames.get(payload.gameID);	
		if (!game)
			return;
		console.log('Game found', game);
		// if (game.left.socket == client.id) {
		// 	console.log('Left paddle moved');
		// 	game.left.y = payload.y;
		// } else if (game.right.socket == client.id) {
		// 	console.log('Right paddle moved');
		// 	game.right.y = payload.y;
		// }
		if (payload.direction == 'up') {
			game.left.y -= 10;
		}
		this.server.emit('game/update', game);
		console.log('Game updated', game);
		this.currentGames.set(payload.gameID, game);
	}

	async upleft(y: number)
	{
		const game = this.currentGames[0];
		game.left.y = y;
		this.server.emit('game/update', game);
	}

	private async createGame () {
		const players = Array.from(this.waitingPlayers);

		const random = Math.round(Math.random());

		const player1 = players[random];
		const player2 = players[1 - random];


		const game: Game = {
			id: uuidv4(),
			left: new Paddle(player1, 10, 180, true),
			right: new Paddle(player2, 690, 180, false)
		}

		this.waitingPlayers.clear();
		this.server.emit('game/start', game);
		console.log('Game starting!!', game);
		this.currentGames.set(game.id, game);
	}
}

interface Game {
	id: string;
	left: Paddle;
	right: Paddle;
}

interface position {
	x: number;
	y: number;
}

class Paddle {
	readonly socket: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;

	constructor(socket: string, x: number, y: number, left: boolean) {
		/* Set readonly properties */
		this.left = left;
		this.right = !left;
		this.socket = socket;

		this.x = x;
		this.y = y;

		this.width = 10;
		this.height = 60;

	}
}