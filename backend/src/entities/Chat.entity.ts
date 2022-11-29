import { Column, BeforeInsert, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { User } from "./User.entity";
import { Message } from "./Message.entity";

export enum ChatType {
	PRIVATE = "PRIVATE", // Private chat between two users
	GROUP = "GROUP", // Group chat between multiple users
	GROUP_PROTECTED = "GROUP_PROTECTED", // Group chat between multiple users with password
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

	@Column({ nullable: true })
	name: string; /* groupchat name or the other users username */

	// @ManyToOne(() => User)
	// @JoinColumn()
	// admins: User[];

	@ManyToMany(() => User, (user) => user.chats, {
		onDelete: 'CASCADE',
		eager: true,
	})
	@JoinTable()
	users: User[];
	
	@OneToMany(() => Message, (message) => message.parent)
	@JoinTable()
	messages: Message[];

	@Column({ nullable: true })
	password: string;

	@ApiProperty({ description: 'Creation Date epoch', example: '1669318644507' })
	@Column()
	createdAt: string;

	@BeforeInsert()
	updateDates() {
		const date = new Date().valueOf() + 3600;
		this.createdAt = date.toString();
	}
}