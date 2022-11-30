import { IsNumber, IsOptional, IsString } from "class-validator";

export class MessageDto {

	@IsOptional()
	@IsNumber()
	senderID: number;

	@IsNumber()
	chatID: number;

	@IsString()
	message: string;
}