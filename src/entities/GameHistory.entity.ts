import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class GameHistory {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	mode: string; // TODO Change to Enum?

	@ManyToOne(() => User, (user) => user.games_won, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	winner: User;

	@ManyToOne(() => User, (user) => user.games_lost, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	loser: User;

	@Column({ default: false })
	draw: boolean;

	@Column({ default: 0 })
	winnerScore: number;

	@Column({ default: 0 })
	loserScore: number;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;
}