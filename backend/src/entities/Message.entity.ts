import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chat } from "./Chat.entity";
import { User } from "./User.entity";

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	message: string;

	@OneToOne(() => User)
	@JoinColumn()
	sender: User;

	@ManyToOne(() => Chat, (chat) => chat.messages)
	parent: Chat;

	@CreateDateColumn({ type: "timestamp" })
	createdAt: Date;
}