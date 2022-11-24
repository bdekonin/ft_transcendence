import { Column, BeforeInsert, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	// @ApiProperty({ description: 'Creation Date epoch', example: '1669318644507' })
	@Column()
	createdAt: string;

	@BeforeInsert()
	updateDates() {
		const date = new Date().valueOf() + 3600;
		this.createdAt = date.toString();
	}
}