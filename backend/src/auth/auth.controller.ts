import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard, GoogleAuthGuard } from './utils/Guards'
import { ApiTags } from "@nestjs/swagger";
import { Response } from 'express'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	/* 42 */
	@Get('42/login')
	@UseGuards(FortyTwoAuthGuard)
	handleLoginFortyTwo(
		// @Req req: Request,
		@Res({passthrough: true}) res: Response,
	) {
		res.redirect('http://localhost:3006');
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
	handleRedirectGoogle(
		// @Req req: Request,
		@Res({passthrough: false}) res: Response,
	) {
		res.redirect('http://localhost:3006');
	}

	@Get('status')
	user(@Req() request: Request) {
		const user = request.user;
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
