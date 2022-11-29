import { Inject, UseGuards } from '@nestjs/common';
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
  } from '@nestjs/websockets';
import { Server } from 'http';
import { authorize } from 'passport';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/utils/jwt-auth.guard';
import { User } from 'src/entities/User.entity';

@WebSocketGateway({
	cors: {
		origin: [
			'http://localhost:3006',
		],
		credentials: true,
	},
	// transports: ['websocket'],
})
export class chatGateway {
	constructor (
		@Inject('AUTH_SERVICE') private readonly authService: AuthService,
	) {
		console.log("chat Gateway constructor");
	}

	@WebSocketServer()
	server: Server;

	async handleConnection (client: any, ...args: any[]) {
		console.log('client connected', client.id);
		const user = await this.findUser(client)
		console.log('user', user);
	}

	async newFriendRequest (data: any) {
		console.log('newFriendRequest', data);
	}




	private parseCookies (cookies: string) {
		const list = {};
		cookies && cookies.split(';').forEach((cookie) => {
			const parts = cookie.split('=');
			list[parts.shift().trim()] = decodeURI(parts.join('='));
		});
		return list;
	}

	private async findUser (client: any): Promise<User> {
		const cookies = this.parseCookies(client.handshake.headers.cookie);
		const user = await this.authService.verifyJWT(cookies['jwt'])
		// if (!user) {
		// 	throw new Error('User not found');
		// }
		return user;
	}
}