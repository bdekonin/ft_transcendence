import { IsString, IsNotEmpty, IsNumber, min, Min, IsDefined, IsInt, IsIn } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDTO {

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		description: 'The name of the game',
		example: '1v1',
		default: '1v1',
	})
	public mode : string;

	@IsNotEmpty()
	@ApiProperty({
		description: 'The id of the winner',
		example: 1
	})
	public winner : number;

	@IsNotEmpty()
	// @IsNumber()
	@ApiProperty({
		description: 'The id of the loser',
		example: 2
	})
	public loser : number;

	@IsNotEmpty()
	// @IsNumber()
	// @Min(0)
	@ApiProperty({
		description: 'The score of the winner',
		example: 10
	})
	public winnerScore : number;

	@IsNotEmpty()
	// @IsNumber()
	// @Min(0)
	@ApiProperty({
		description: 'The score of the loser',
		example: 5
	})
	public loserScore : number;
}