import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { json } from "stream/consumers";
import { UserService } from "./user.service";

@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('api/user/wins')
	async incWin(@Req() request: Request, @Body() body)
	{
		var user = request.user;

		if (!user)
			throw new UnauthorizedException();


		
		console.log(body);
		console.log(request.rawHeaders);
		

		this.userService.setWins(user['id']);
	}


}