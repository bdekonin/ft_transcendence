import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class MessageDto {

	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: true })
	senderID: number;

	@IsNumber()
	@ApiProperty({ required: true })
	chatID: number;

	@IsString()
	@ApiProperty({ required: true })
	message: string;
}