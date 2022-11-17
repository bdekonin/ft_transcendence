import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard, GoogleAuthGuard } from './utils/Guards'
import { ApiTags } from "@nestjs/swagger";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	/* 42 */
	@Get('42/login')
	@UseGuards(FortyTwoAuthGuard)
	handleLoginFortyTwo() {
		return { msg: '42 Authentication'}
	}

	// auth/42/redirect
	@Get('42/redirect')
	@UseGuards(FortyTwoAuthGuard)
	handleRedirectFortyTwo() {
		return { msg: 'OK 42'}
	}

	/* Google */
	@Get('google/login')
	@UseGuards(GoogleAuthGuard)
	handleLoginGoogle() {
		return { msg: 'Google Authentication'}
	}

	@Get('google/redirect')
	@UseGuards(GoogleAuthGuard)
	handleRedirectGoogle() {
		return { msg: 'OK GOOGLE'}
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
	destroySession(@Req() request: Request) {
		console.log('Destroying session')
		request.session.destroy(function(err) {
			// cannot access session here
			// what to do here?
		});
	}

	@Get('clear')
	clear() {
		this.authService.membershipRepo.clear();
		this.authService.getPlayerRepository().clear();
	}
}