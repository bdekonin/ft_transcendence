import { IsString, IsNotEmpty, IsNumber, min, Min, IsDefined, IsInt, IsIn } from "class-validator";

export class CreateGameDTO {

	@IsNotEmpty()
	@IsString()
	public mode : string;

	@IsNotEmpty()
	public winner : number;

	@IsNotEmpty()
	// @IsNumber()
	public loser : number;

	@IsNotEmpty()
	// @IsNumber()
	// @Min(0)
	public winnerScore : number;

	@IsNotEmpty()
	// @IsNumber()
	// @Min(0)
	public loserScore : number;
}