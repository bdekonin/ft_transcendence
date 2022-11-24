import { Column, BeforeInsert, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { ApiProperty } from '@nestjs/swagger';


@Entity()
export class Friend {
	@ApiProperty({ description: 'The id of the friendship', example: 1 })
	@PrimaryGeneratedColumn()
	id: number;

	@ApiProperty({ description: 'the sender of the friendship', type: () => User })
	@ManyToOne(() => User, (user) => user.sentFriendRequests, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	sender: User;

	@ApiProperty({ description: 'the reciever of the friendship', type: () => User })
	@ManyToOne(() => User, (user) => user.receivedFriendRequests, {	eager: true, onDelete: 'CASCADE'})
	@JoinColumn()
	reciever: User;

	@ApiProperty({ description: 'The status of the friendship', example: 'accepted' })
	@Column({default: 'pending'})
	status: string;

	@ApiProperty({ description: 'Creation Date epoch', example: '1669318644507' })
	@Column()
	createdAt: string;

	@BeforeInsert()
	updateDates() {
		const date = new Date().valueOf() + 3600;
		this.createdAt = date.toString();
	}
}