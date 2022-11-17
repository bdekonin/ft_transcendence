import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class GameHistory {

	@ApiProperty({ description: 'The id of the game', example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'Type of game', example: '1v1', default: '1v1' })
	@Column()
	mode: string; // TODO Change to Enum?

	@ApiProperty({ description: 'The winner of the game', type: () => User })
	@ManyToOne(() => User, (user) => user.games_won, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	winner: User;

	@ApiProperty({ description: 'The loser of the game', type: () => User })
	@ManyToOne(() => User, (user) => user.games_lost, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	loser: User;

	@ApiProperty({ description: 'Is the game a draw?', example: false })
	@Column({ default: false })
	draw: boolean;

	@ApiProperty({ description: 'score of the winner', example: 10 })
	@Column({ default: 0 })
	winnerScore: number;

	@ApiProperty({ description: 'score of the loser', example: 5 })
	@Column({ default: 0 })
	loserScore: number;

	@ApiProperty({ description: 'Creation Date', example: '2021-01-01T00:00:00.000Z' })
	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;
}