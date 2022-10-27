import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Membership } from 'src/entities/Membership.entity';
import { MembershipDto } from './membership.dto';
import { MembershipService } from './membership.service';

@Controller('/user/membership/:userID/')
export class MembershipController {
	constructor(private readonly membershipService: MembershipService) {}

	// /user/membership/:userID/
	@Patch('update')
	async update(
		@Param('userID') userID: number,
		@Body() membershipDto: MembershipDto
		) : Promise<Membership> {
			return await this.membershipService.update(userID, membershipDto);
	}

	@Get()
	async get(
		@Param('userID') userID: number
		) : Promise<Membership> {
		return await this.membershipService.get(userID);
	}
}
