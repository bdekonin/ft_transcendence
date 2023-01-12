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
import { CreateGameDTO } from 'src/game/game.dto';
import { GameService } from 'src/game/game.service';
import { hostname } from 'src/main';

class userDto {
	id: number; /* user id */
	username?: string;
}


class UserSocket {
  userID?: number;
  socketID?: string;
}



@WebSocketGateway({
	cors: {
		origin: [
			"http://" + "localhost" + ":3006",
			"http://" + "localhost" + ":3000",
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
		private readonly gameService: GameService,
	) {
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
	}

	/* Chats */
	@SubscribeMessage('chat/join')
	async handleJoinChannel (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		/* Add client to every chat he is in */
		client.join('chat:' + payload.chatID);

		const payloadToBeSent = {
			id: payload.chatID,
			user: user,
		}

		/* Update all users in chat */
		this.server.to('chat:' + payload.chatID).emit('chat/refresh-users-join', payloadToBeSent);
	}

	@SubscribeMessage('chat/leave')
	async handleLeaveChannel (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		client.leave('chat:' + payload.chatID);

		/* get all users in chat */
		const users = await this.chatService.getUsers(payload.chatID);
		if (!users) {
			this.server.emit('chat/refresh-chats');
			return ;
		}

		const payloadToBeSent = {
			id: payload.chatID,
			user: user,
		}

		/* Update all users in chat */
		this.server.to('chat:' + payload.chatID).emit('chat/refresh-users-leave', payloadToBeSent);
	}
	
	@SubscribeMessage('chat/new-chat')
	async emitNewChatMessage(client: Socket, payload: MessageDto) {
		const user = await this.findUser(client)
		if (!user)
			return;
	
		if (user.id != payload.senderID) {
			return;
		}
		if (payload.message.length == 0) {
			return ;
		}
		const messagePayload = await this.chatService.sendMessage(payload.chatID, user.id, payload.message);
		this.server.in('chat:' + payload.chatID).emit('chat/refresh-message', messagePayload);
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
		const userID = await this.authService.verifyJWT(cookies['jwt'])
		if (!userID)
			return null;

		const user = await this.authService.findUserById(userID.sub)
		if (!user)
			return null;
		return { id: user.id, username: user.username };
	}

	async userBannedOrKicked(chatID: number, userID: number) {

		const socket = this.connections.find(obj => obj.userID === userID);

		const client = this.server.sockets.sockets.get(socket.socketID);
		if (!client)
			return ;
		client.leave('chat:' + chatID);
	}

























	waitingPlayers: Map<string, Socket> = new Map();
	currentGames: Map<string, Game> = new Map();
	// Map that stores the number of players that left for each game ID
	didBothUsersLeave: Map<string, number> = new Map();

	invitedPlayers: Map<string, Socket> = new Map(); /* inviteID, socket */

	intervalIds: Map<string, NodeJS.Timer> = new Map();


	async calculateBall(game_id: string) {
		let game = this.currentGames.get(game_id);
		if (!game) {
			return ;
		}
		if (game.leftScore >= 10) {
			this.handleEndGame(game, game.left, game.right , game.leftScore, game.rightScore);
			return;
		}
		else if (game.rightScore >= 10) {
			this.handleEndGame(game, game.right, game.left, game.rightScore, game.leftScore);
			return;
		}
		
		// check top canvas bounds
		if(game.ball.y < 10){
			game.ball.yVel = 1;
		}
		
		//check bottom canvas bounds
		if(game.ball.y + game.ball.height > 400 - 10){
			game.ball.yVel = -1;
		}
		
		//check left canvas bounds
		if(game.ball.x < 0){
			game.rightScore += 1;
			game.ball.reset()
			this.currentGames.set(game.id, game);
		}
		
		//check right canvas bounds
		if(game.ball.x + game.ball.width > 700){
			game.leftScore += 1;
			game.ball.reset()
			this.currentGames.set(game.id, game);
		}

		//check left player collision
		if(game.ball.x <= game.left.x + game.left.width + 10){
			if(game.ball.y >= game.left.y && game.ball.y + game.ball.height <= game.left.y + game.left.height){
				game.ball.xVel = 1;
			}
		} 

		//check right player collision
		if(game.ball.x + game.ball.width >= game.right.x){
			if(game.ball.y >= game.right.y && game.ball.y + game.ball.height <= game.right.y + game.right.height){
				game.ball.xVel = -1;
			}
		}
		game.ball.x += game.ball.xVel * (game.ball.speed);
		game.ball.y += game.ball.yVel * (game.ball.speed);

		// socketGateway.update
		this.server.to('game:' + game.id).emit('game/update', game);

		// console.table(game.ball);
		this.currentGames.set(game.id, game);
	}

	createLiveGame(gameId: string) {
		setTimeout(() => {
			const interval_id = setInterval(() => {
				this.calculateBall(gameId);
			}, 30 * 2);
			this.intervalIds.set(gameId, interval_id);
		}, 10000);
	}

	isUserInInviteList (client: Socket): string | null {
		this.invitedPlayers.forEach((socket, inviteID) => {
			if (socket.id == client.id)
				return inviteID;
		});
		return null;
	}

	@SubscribeMessage('game/invite-waiting')
	async handleInviteWaiting (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;

		const inviteID = payload.id;

		const otherUser = this.invitedPlayers.get(inviteID);
		if (otherUser) {
			/* Other user is waiting */

			let tempMap = new Map();
			tempMap.set(client.id, client);
			tempMap.set(otherUser.id, otherUser);
			const players = Array.from(tempMap);

			const game = await this.createGame(players);

			if (game.left.username == game.right.username) {
				this.invitedPlayers.delete(inviteID);
				this.currentGames.delete(game.id);
				return ;
			}

			client.join('game:' + game.id);
			otherUser.join('game:' + game.id);

			this.currentGames.delete(game.id);
			this.server.in('game:' + game.id).emit('game/start', game);
			this.currentGames.set(game.id, game);
			this.createLiveGame(game.id);
		}
		else {
			/* User is waiting on other user */
			this.invitedPlayers.set(inviteID, client);
		}

	}


	async statusOfUser(userID: number, username: string) {
		if (this.connections.find((connection) => connection.userID == userID)) {
			if (this.waitingPlayers.get(userID.toString()))
				return 'online';
			/* Loop through every game and check if user is in game */
			const games = Array.from(this.currentGames.values());
			for (let i = 0; i < games.length; i++) {
				if (games[i].left.username == username || games[i].right.username == username)
					return 'in-game';
			}
			return 'online';
		}
		return 'offline';
	}



	/* Game */

	private parseCurrentGames() {
		const games = Array.from(this.currentGames.values());
		const parsedGames = {};
		games.forEach((game, index) => {
			parsedGames[index] = {
				id: game.id,
				left: game.left.username,
				right: game.right.username,
			};
		});
		return parsedGames;
	}

	@SubscribeMessage('game/spectate-list')
	async handleSpectateList (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		this.server.emit('game/spectate-list', this.parseCurrentGames());
	}

	@SubscribeMessage('game/waiting')
	async handleJoinGame (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		/* Check if user is already in a game */
		const usersCurrentGame = this.isUserInGame(client.id); /* returns game if user is in a game else null */
		if (usersCurrentGame) {
			if (this.didBothUsersLeave.has(usersCurrentGame.id)) {
				this.didBothUsersLeave.delete(usersCurrentGame.id);
			}
			this.server.to('game:' + usersCurrentGame.id).emit('game/rejoin', usersCurrentGame);
			return ;
		}

		this.waitingPlayers.set(client.id, client);
		if (this.waitingPlayers.size >= 2) {
			/* Check if both players arent the same user */
			const players = Array.from(this.waitingPlayers);
			const game = await this.createGame(players);

			if (game.left.username == game.right.username) {
				this.waitingPlayers.clear();
				this.currentGames.delete(game.id);
				return ;
			}

			/* Adding players to game room */
			this.waitingPlayers.get(game.left.socket).join('game:' + game.id);
			this.waitingPlayers.get(game.right.socket).join('game:' + game.id);

			this.waitingPlayers.clear();
			this.server.in('game:' + game.id).emit('game/start', game);
			this.currentGames.set(game.id, game);
			this.createLiveGame(game.id);
		}
		this.server.emit('game/spectate-list', this.parseCurrentGames());
	}


	isUserInGame (clientID: string): Game {
		/* Looping through all current games */
		for (const game of this.currentGames.values()) {
			if (game.left.socket == clientID || game.right.socket == clientID)
				return game;
		}
		return null;
	}

	@SubscribeMessage('game/leave')
	async handleLeaveGame (client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		this.waitingPlayers.delete(client.id);

		/* Check if user is in a invite */
		const inviteID = this.isUserInInviteList(client);
		if (inviteID) {
			this.invitedPlayers.delete(inviteID);
		}

		const usersCurrentGame = this.isUserInGame(client.id);
		if (usersCurrentGame) {
			/* User is still in a game */

			/* Check if both users left */
			if (this.didBothUsersLeave.has(usersCurrentGame.id)) {
				/* Both users left */
				this.didBothUsersLeave.set(usersCurrentGame.id, this.didBothUsersLeave.get(usersCurrentGame.id) + 1);
				if (this.didBothUsersLeave.get(usersCurrentGame.id) == 2) {
					/* Both users left */

					/* POST REQUEST TO DRAW GAME */
					const postGame: CreateGameDTO = {
						mode: "1v1",
						winner: (await this.userService.findUserByUsername(usersCurrentGame.left.username)).id,
						loser: (await this.userService.findUserByUsername(usersCurrentGame.right.username)).id,
						winnerScore: 0,
						loserScore: 0,
					}

					await this.gameService.create(postGame);

					this.currentGames.delete(usersCurrentGame.id);
					this.didBothUsersLeave.delete(usersCurrentGame.id);
					this.server.emit('game/spectate-list', this.parseCurrentGames());
				}
			} else {
				/* One user left */
				this.didBothUsersLeave.set(usersCurrentGame.id, 1);
			}
			return ;
		}
		/* Leave game room */
		client.leave('game:' + payload?.id);
		this.server.emit('game/spectate-list', this.parseCurrentGames());
	}

	/* Mouse movement */
	@SubscribeMessage('game/move')
	async handleMouseMove(client: Socket, payload: any) {
		const user = await this.findUser(client)
		if (!user)
			return;
		const game = this.currentGames.get(payload.id);
		if (!game) {
			return;
		}
		if (game.left.socket == client.id) {
			if (payload.y + 60 >= 400)
				return;
			if (payload.y <= 0)
				return;
			game.left.y = payload.y;
		} else if (game.right.socket == client.id) {
			if (payload.y + 60 >= 400)
				return;
			if (payload.y <= 0)
				return;
			game.right.y = payload.y;
		}
		// save game
		this.currentGames.set(payload.id, game);
		// this.server.to('game:' + payload.id).emit('game/update', game);
	}

	@SubscribeMessage("game-spectator-leave")
	async leaveSpectator(client: Socket, gameID: String | undefined) {
		this.currentGames.forEach((game) => {
			client.leave("game:" + game.id)
		})

	}

	// @SubscribeMessage('game/score')
	// async handleScore (client: Socket, payload: any) {
	// 	const user = await this.findUser(client)
	// 	if (!user)
	// 		return;
	// 	const game = this.currentGames.get(payload.id);
	// 	if (!game) {
	// 		return;
	// 	}
	// 	if (game.left.socket == client.id && payload.side == 'left') {
	// 		game.leftScore += 1;
	// 	} else if (game.right.socket == client.id && payload.side == 'right') {
	// 		game.rightScore += 1;
	// 	}
	// 	if (game.leftScore >= 10) {
	// 		this.handleEndGame(game, game.left, game.right , game.leftScore, game.rightScore);
	// 		return;
	// 	}
	// 	else if (game.rightScore >= 10) {
	// 		this.handleEndGame(game, game.right, game.left, game.rightScore, game.leftScore);
	// 		this.server.emit('game/spectate-list', this.parseCurrentGames());
	// 		return;
	// 	}

	// 	// save game
	// 	game.ball.reset(); 
	// 	this.currentGames.set(payload.id, game);
	// 	this.server.to('game:' + payload.id).emit('game/update', game);
	// 	this.server.to('game:' + payload.id).emit('game/ball', game.ball);
	// }

	@SubscribeMessage('game/request-spectate')
	async handleRequestSpectate (client: Socket, payload: any) {
		/* payload only has .id */

		const user = await this.findUser(client)
		if (!user)
			return;
		const game = this.currentGames.get(payload.id);
		if (!game) {
			return;
		}
		this.waitingPlayers.delete(client.id);
		this.server.to(client.id).emit('game/spectate', game);
		client.join('game:' + payload.id);
	}

	async handleEndGame (game: Game, winner?: Paddle, loser?: Paddle, winnerScore?: number, loserScore?: number) {
		this.currentGames.delete(game.id);
		const intervalID = this.intervalIds.get(game.id);
		clearInterval(intervalID);
		this.intervalIds.delete(game.id);

		if (!winner && !loser) { /* Draw */
			this.server.to('game:' + game.id).emit('game/end');
			this.server.socketsLeave('game:' + game.id);
			const postGame: CreateGameDTO = {
				mode: "1v1",
				winner: (await this.userService.findUserByUsername(game.left.username)).id,
				loser: (await this.userService.findUserByUsername(game.right.username)).id,
				winnerScore: 0,
				loserScore: 0,
			}

			await this.gameService.create(postGame);
			return ;
		}
		/* Remove user from the socket room */
		this.server.to('game:' + game.id).emit('game/end', { winner: winner.username });
		this.server.socketsLeave('game:' + game.id);

		const postGame: CreateGameDTO = {
			mode: "1v1",
			winner: (await this.userService.findUserByUsername(winner.username)).id,
			loser: (await this.userService.findUserByUsername(loser.username)).id,
			winnerScore: winnerScore,
			loserScore: loserScore,
		}
		await this.gameService.create(postGame);
	}

	private async createGame (players: any[]): Promise<Game> {
		const random = Math.round(Math.random());
		
		const player1 = players[random];
		const player2 = players[1 - random];
		
		const tempUser1 = await this.findUser(player1[1]);
		const tempUser2 = await this.findUser(player2[1]);
		if (!tempUser1 || !tempUser2)
		return null;
		
		const user1 = await this.userService.findUserById(tempUser1.id);
		const user2 = await this.userService.findUserById(tempUser2.id);
		
		const game: Game = {
			id: uuidv4(),
			left: new Paddle(player1[0], user1.username, 10, 190, true),
			right: new Paddle(player2[0], user2.username, 700 - 20, 190, false),
			ball: new Ball(350, 190),
			leftScore: 0,
			rightScore: 0
		}

		return game;
	}
}

interface Game {
	id: string;
	left: Paddle;
	right: Paddle;
	ball: Ball;

	leftScore: number;
	rightScore: number;
}

class Ball {
	readonly speed: number = 12; /* 2.5 */

	x: number;
	y: number;
	xVel:number = 0;
	yVel:number = 0;

	readonly width: number;
	readonly height: number;

	private startingX: number;
	private startingY: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.startingX = x;
		this.startingY = y;

		this.width = 10;
		this.height = 10;

		/* Random direction */
		const random = Math.floor(Math.random() * 2) + 1;
		if (random % 2 == 0)
			this.xVel = 1;
		else
			this.xVel = -1;
		this.yVel = 1;
	}

	/* Only resets ball position and direction */
	reset () {
		this.x = this.startingX;
		this.y = this.startingY;
		/* Random direction */
		const random = Math.floor(Math.random() * 2) + 1;
		if (random % 2 == 0)
			this.xVel = 1;
		else
			this.xVel = -1;
		this.yVel = 1;
	}
}

class Paddle {
	readonly socket: string;
	readonly username: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;

	constructor(socket: string, username: string, x: number, y: number, left: boolean) {
		/* Set readonly properties */
		this.left = left;
		this.right = !left;
		this.socket = socket;
		this.username = username;

		this.x = x;
		this.y = y;

		this.width = 10;
		this.height = 60;

	}
}