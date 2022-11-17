import { Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Membership, UserRole } from "src/entities/Membership.entity";
import { UserService } from "src/user/user.service";
import { UserDetails } from "src/utils/types";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {

	constructor(
		private userService: UserService,
		@InjectRepository(Membership) public membershipRepo:
		Repository<Membership>,
	) {}

	async validateUser(details: UserDetails) {
		const user = await this.getPlayerRepository().findOneBy({username: details.username})

		if (user)
			return user;

		console.log('User not found. Creating...');
		
		const newMembership = this.membershipRepo.create();
		const savedMembership = await this.membershipRepo.save(newMembership);
		
		const newUser = this.getPlayerRepository().create(details);
		newUser.membership = savedMembership;
		return this.getPlayerRepository().save(newUser);
	}

	getPlayerRepository() {
		return this.userService.userRepository;
	}

	async findUserById(id: number)
	{
		return await this.userService.findUserById(id)
	}
	async findUserByUsername(username: string)
	{
		return await this.userService.findUserByUsername(username);
	}
	async findUserByIdUsername(idArg:number, usernameArg: string)
	{
		return await this.userService.findUserByIdUsername(idArg, usernameArg)
	}
}

