import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "src/entities/Membership.entity";

export class MembershipDto
{
	@IsOptional()
	@IsEnum(UserRole)
	public role: UserRole

	@IsOptional()
	@IsBoolean()
	public banned : boolean;

	@IsOptional()
	@IsBoolean()
	public muted : boolean;
}