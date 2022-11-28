import { Controller, createParamDecorator, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { AuthenticateGuard, FortyTwoAuthGuard, GoogleAuthGuard } from './utils/Guards'
import { ApiTags } from "@nestjs/swagger";
import { Response } from 'express'
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "./utils/jwt-auth.guard";
import { User } from "src/entities/User.entity";

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
		@Req() req: Request,
		@Res({passthrough: false}) res: Response,
	) {
		return this.doCallback(req, res);
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
		@Req() req: Request,
		@Res({passthrough: false}) res: Response,
	) {
		return this.doCallback(req, res);
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

	@Get('verify-session')
	verify_session(@Req() request: Request) {
		console.log('Verifying session')
		console.log(request.session)
	}

	@Get('jwt')
	@UseGuards(JwtAuthGuard)
	jwt(@Req() req: Request) {
		console.log('jwt')
		console.log(req.header)
		console.log('jwt', req.headers.authorization);

		// console.log
		if (!req.headers.authorization) return false;
		const token = req.headers.authorization.split(' ')[1];
		const payload = this.authService.verifyJWT(token);
		return !!payload;
	}


	private doCallback(req: Request, res: Response) {
		const user = req.user as User;
		if (!user)
			return res.redirect(process.env.FRONTEND_REDIRECT_UR);
		const token = this.authService.createToken(user.id);
		res.cookie('jwt', token, { httpOnly: true });
		res.header('Authorization', 'JWT ' + token);
		
		res.redirect(process.env.FRONTEND_REDIRECT_URL);
		return { token };
	}
}


export const AuthUserJWT = createParamDecorator((data, req) => {
	return req.user;
});