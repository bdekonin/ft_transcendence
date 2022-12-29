import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "src/entities/User.entity";
import { UserRequest } from "src/user/user.decorator";
import { UserService } from "src/user/user.service";
import { JwtAuthGuard } from "../utils/jwt-auth.guard";

@Controller('twofa')
export class TwoFAController {
	constructor(
		private readonly userService: UserService
	) {}

	//Returns the qr / secret key to verify
	@Get()
	@UseGuards(JwtAuthGuard)
	async getSecretKey(@UserRequest() user: User) {
		return await this.userService.getTwoFA(user.id);
	}

	@Get('status')
	@UseGuards(JwtAuthGuard)
	getStatus(@UserRequest() user: User) {
		return this.userService.getTwoFAStatus(user.id);
	}

	@Patch('enable')
	@UseGuards(JwtAuthGuard)
	enableTwoFa(@UserRequest() user: User, @Body() body: any) {
		return this.userService.enableTwoFA(user.id, body.token);
	}

	@Patch('disable')
	@UseGuards(JwtAuthGuard)
	disableTwoFa(@UserRequest() user: User, @Body() body: any) {
		return this.userService.disableTwoFa(user.id, body.token);
	}

	@Post('verify')
	@UseGuards(JwtAuthGuard)
	isVerified(@UserRequest() user: User, @Body() body: any) {
		return this.userService.verifyTwoFA(user.id, body.token);
	}
}
