import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { User } from "./User.entity";
import { Message } from "./Message.entity";

export enum ChatType {
	PRIVATE, // Private chat between two users
	GROUP, // Group chat between multiple users
	GROUP_PROTECTED, // Group chat between multiple users with password
}

@Entity()
export class Chat {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: "enum",
		enum: ChatType,
	})
	type: ChatType;

	@Column()
	name: string; /* groupchat name or the other users username */

	// @ManyToOne(() => User)
	// @JoinColumn()
	// admins: User[];

	@ManyToMany(() => User, (user) => user.chats)
	@JoinTable()
	users: User[];
	
	@OneToMany(() => Message, (message) => message.parent)
	@JoinColumn()
	messages: Message[];

	@Column({ nullable: true })
	password: string;

	@ApiProperty({ description: 'Creation Date', example: '2021-01-01T00:00:00.000Z' })
	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;
}