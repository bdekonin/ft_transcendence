import { IsNumber, IsOptional, IsString } from "class-validator";

export class JoinChatDto {
	
	@IsNumber()
	chatID: number;

	@IsOptional()
	@IsString()
	password: string;
}