import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { GameHistory } from "./GameHistory.entity";
import { Membership } from "./Membership.entity";
import { Friend } from "./Friend.entity";


// https://www.tutorialspoint.com/typeorm/typeorm_entity.htm

@Entity()
export class User {
	@PrimaryColumn()
	id: number; // unique ID of User

	@PrimaryColumn()
	username: string; // Unique username

	@Column({ default: 'https://cdn.intra.42.fr/users/medium_default.png' })
	avatar: string; // Link to image || or file path to image

	// @Column() // One to One
	@OneToOne(() => Membership )
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

	@ManyToMany(() => GameHistory)
	@JoinTable()
	game_history: GameHistory[];

	@CreateDateColumn()
	createdAt: Date;

	@OneToMany(() => Friend, (friend) => friend.sender) // Applicant
	sentFriendRequests: Friend[];

	@OneToMany(() => Friend, (friend) => friend.reciever) // Recipient
    receivedFriendRequests: Friend[];

}