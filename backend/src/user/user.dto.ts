import { isBoolean, IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/entities/Membership.entity";

export class updateUserDto {

	@IsOptional()
	@IsString()
	username?: string;

	@IsOptional()
	@IsBoolean()
	twofa?: boolean;

}