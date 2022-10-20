import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Membership } from "./Membership.entity";


// https://www.tutorialspoint.com/typeorm/typeorm_entity.htm

@Entity()
export class User {
	@PrimaryColumn()
	id: number; // unique ID of User

	@PrimaryColumn()
	username: string; // Unique username

	@Column({ nullable: false })
	avatar: string; // Link to image || or file path to image

	// @Column() // One to One
	@OneToOne(() => Membership)
	@JoinColumn()
	membership: Membership; // extends to .role .banned .muted

	@Column({ default: 0 })
	level: number;

	@Column({ default: 0})
	wins: number;

	@Column({ default: 0})
	loses: number;

	@Column({ default: false})
	twofa: boolean;

	@Column({ default: 0 }) // One to Many
	game_history: number; // history of games

	@CreateDateColumn()
	createdAt: Date;

	@Column({ default: 0 }) // One to Many 
	friends: number; // list of friends(relations)
}