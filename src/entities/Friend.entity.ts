import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

@Entity()
export class Friend {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.friends, {
		eager: true,
	})
	sender: User;

	@Column()
	relationStatus: string;

	/* The user that is being followed || Pending */
	@ManyToOne(() => User, {
		eager: true, /* Means when true that when Relation is loaded user will automatically be fetched */
	})
	@JoinColumn()
	reciever: User;
}