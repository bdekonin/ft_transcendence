import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class JoinChatDto {
	
	@IsNumber()
	@ApiProperty({ required: true, example: 1 })
	chatID: number;

	@IsOptional()
	@IsString()
	@ApiProperty({ required: false, example: "password" })
	password: string;
}