import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from 'src/entities/Membership.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user.service';
import { MembershipDto } from './membership.dto';

@Injectable()
export class MembershipService {
	constructor(
		@InjectRepository(Membership) public repo: Repository<Membership>,
		private readonly userService: UserService
		) {}
	
	async update(userID: number, membershipDto: MembershipDto) : Promise<Membership> {
		const user = this.userService.findUserById(userID);
		// if (!user)
			// throw new
		const membership = (await user).membership;

		if (membershipDto.role != membership.role)
			membership.role = membershipDto.role;
		if (membershipDto.banned != membership.banned)
			membership.banned = membershipDto.banned;
		if (membershipDto.muted != membership.muted)
			membership.muted = membershipDto.muted;

		return await this.repo.save(membership);
	}

	async get(userID: number) : Promise<Membership> {
		const user = this.userService.findUserById(userID);
		if (!user)
			throw new HttpException('User not found.', HttpStatus.BAD_REQUEST);
		const temp = await this.repo.findBy({
			
		})
		return (await user).membership;
	}
}
