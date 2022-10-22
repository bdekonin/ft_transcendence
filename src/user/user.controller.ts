import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
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
			relations: ['membership', 'game_history', 'friends']
		});
	}

	@Get('addgame')
	async addgame() {
		const user = await this.userService.userRepository.findOne({
				where: {
					username: 'bdekonin',
				},
				relations: ['game_history']
			});

		if (!user)
			return { msg: 'fail' };
		const newGame = this.userService.GamesRepository.create({
			winnerScore: Math.floor(Math.random() * 10),
			loserScore: Math.floor(Math.random() * 10),
		});

		const savedGame = await this.userService.GamesRepository.save(newGame);

		user.game_history.push(savedGame);
		return this.userService.userRepository.save(user)
	}

	@Get('addfriend')
	async addfriend() {
		const user = await this.userService.userRepository.findOne({
				where: {
					username: 'bdekonin',
				},
				relations: ['friends']
			});

		if (!user)
			return { msg: 'fail' };

		const newFriendRequest = this.userService.friendsRepository.create({
			sender: user,
			relationStatus: "Friend",
			reciever: user,
		});
		const savedFriendRequest = await this.userService.friendsRepository.save(newFriendRequest);
		user.friends.push(savedFriendRequest);
		return this.userService.userRepository.save(user);
	}
}