import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Friend {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.sentFriendRequests, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	sender: User;

	@ManyToOne(() => User, (user) => user.receivedFriendRequests, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	reciever: User;

	@Column({default: 'pending'})
	status: string;

	@CreateDateColumn()
	createdOn: Date;
}