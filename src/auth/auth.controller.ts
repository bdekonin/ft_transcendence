import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from './utils/Guards'

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
		var user = request.session['passport'];
		console.log("userfunction");
		console.log(user);

		if (user) {
			return { msg: 'Authenticated' };
		} else {
			return { msg: 'Not Authenticated'};
		}
	}
}
