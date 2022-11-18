import { ApiProperty } from "@nestjs/swagger";
import { isBoolean, IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "src/entities/Membership.entity";

export class updateUserDto {

	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	username?: string;

	@IsOptional()
	@IsBoolean()
	@ApiProperty({ required: false })
	twofa?: boolean;

}