import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional } from "class-validator";

export class updateUserDto {

	@IsOptional()
	// @IsString()
	@ApiProperty({ required: false })
	username?: string;

	@IsOptional()
	@IsBoolean()
	@ApiProperty({ required: false })
	twofa?: boolean;

	@IsOptional()
	avatar?: string;
}