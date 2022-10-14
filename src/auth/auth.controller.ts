import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { FortyTwoAuthGuard } from './utils/Guards'

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// auth/42/login
	@Get('42/login')
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






	@Post('signup')
	signup() {
		return this.authService.signup();
	}

	@Post('signin')
	signin() {
		return this.authService.signin()
	}
}
