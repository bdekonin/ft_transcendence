import { Inject } from '@nestjs/common';
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

@WebSocketGateway({
	cors: {
		origin: [
			'http://localhost:3006',
		],
		credentials: true,
	}
})
export class chatGateway {

	constructor (
		@Inject('AUTH_SERVICE') private readonly authService: AuthService,
	) {
		console.log("chatGateway constructor");
	}

	@WebSocketServer()
	server: Server;

	handleConnection (client: any, ...args: any[]) {
		console.log('client connected', client.id);
	}

	@SubscribeMessage('ping')
	ping (client: any, payload: any): WsResponse<any> {
		// console.log('ping', client, payload);

		// CookieParser('randomStringLol')(client.request, client.request.res, () => {

		const cookies = this.parseCookies(client.handshake.headers.cookie);
		console.log(cookies['jwt'])
		console.log(cookies['jwt']['access_token']);



		this.server.emit('pang', { user: 'Bobbie', message: 'Hello there!' });
		return { event: 'pong', data: payload };
	}

	private parseCookies (cookies: string) {
		const list = {};
		cookies && cookies.split(';').forEach((cookie) => {
			const parts = cookie.split('=');
			list[parts.shift().trim()] = decodeURI(parts.join('='));
		});
		return list;
	}
}