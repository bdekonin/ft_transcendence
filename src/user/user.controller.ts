import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { User } from "src/entities/User.entity";
import { UserService } from "./user.service";


@Controller()
export class UserController {
	constructor(private readonly userService: UserService) {}


	@Get(':id/addwin')
	async setWin(
		@Param('id', ParseIntPipe) id: number
	) {
		const user = await this.userService.findUserById(id);

		user.wins++;
		console.log(user.username + ' has won! [' + user.wins + ']');

		this.userService.userRepository.save(user);
		return { msg: 'wins is increased by one for ' + id }
	}

	@Get('all')
	async all(): Promise<User[]> {
		return await this.userService.userRepository.find({
			relations: ['membership', 'games_won', "games_lost", 'sentFriendRequests', 'receivedFriendRequests']
		});
	}
}