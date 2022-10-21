import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameHistory {
	@PrimaryGeneratedColumn()
	id: number;

	// @Column()
	// mode: string; // TODO Change to Enum?

	// @Column()
	// winner: User

	// @Column()
	// loser: User

	@Column({ default: 0 })
	winnerScore: number;

	@Column({ default: 0 })
	loserScore: number;

	@CreateDateColumn()
	createdAt: Date;
}