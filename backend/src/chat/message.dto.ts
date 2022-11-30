import { IsNumber, IsString } from "class-validator";

export class MessageDto {

	@IsNumber()
	chatID: number;

	@IsString()
	message: string;
}