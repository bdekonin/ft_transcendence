import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@ApiProperty({ description: 'the date the friendship was created', example: '2021-01-01T00:00:00.000Z' })
	@CreateDateColumn({ type: 'timestamp' })
	createdOn: Date;
}