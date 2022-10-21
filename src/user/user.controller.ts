import { Controller, Get } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";

@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}


	@Get('user')
	getUser() {
		const user = this.userService.playerRepository.find({
			where: {
				username: 'bdekonin',
			},
			relations: ['membership']
		})
		return user;
	}
}