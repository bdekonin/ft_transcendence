import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Relation {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	relationStatus: string;

	/* The user that is being followed || Pending */
	@OneToOne(() => User)
	@JoinColumn()
	reciever: User;
}