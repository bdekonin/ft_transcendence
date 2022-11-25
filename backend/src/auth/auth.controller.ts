import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthenticateGuard, FortyTwoAuthGuard, GoogleAuthGuard } from './utils/Guards'
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
		return { msg: '42 Authentication'}
	}

	// auth/42/redirect
	@Get('42/callback')
	@UseGuards(FortyTwoAuthGuard)
	handleRedirectFortyTwo(
		@Res({passthrough: false}) res: Response,
	) {
		res.redirect(process.env.FRONTEND_REDIRECT_URL);
	}

	/* Google */
	@Get('google/login')
	@UseGuards(GoogleAuthGuard)
	handleLoginGoogle() {
		return { msg: 'Google Authentication'}
	}

	@Get('google/callback')
	@UseGuards(GoogleAuthGuard)
	handleRedirectGoogle(
		// @Req req: Request,
		@Res({passthrough: false}) res: Response,
	) {
		res.redirect(process.env.FRONTEND_REDIRECT_URL);
	}

	@Get('status')
	@UseGuards(AuthenticateGuard)
	user(@Req() request: Request) {
		const user = request.user;
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
}
