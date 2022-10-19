import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthenticateGuard, FortyTwoAuthGuard } from './utils/Guards'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// auth/42/login
	@Get('login')
	@UseGuards(FortyTwoAuthGuard)
	handleLogin() {
		return { msg: '42 Authentication'}
	}

	// auth/42/redirect
	@Get('42/redirect')
	@UseGuards(FortyTwoAuthGuard)
	handleRedirect() {
		return { msg: 'OK'}
	}

	@Get('status')
	user(@Req() request: Request) {
		var user = request.user;
		console.log("userfunction");
		console.log(user);

		if (user) {
			return { msg: 'Authenticated' };
		} else {
			return { msg: 'Not Authenticated'};
		}
	}

	@Get('destroy')
	@UseGuards(AuthenticateGuard)
	destroySession(@Req() request: Request) {
		console.log('Destroying session')
		request.session.destroy(function(err) {
			// cannot access session here
			// what to do here?
		});
	}
}