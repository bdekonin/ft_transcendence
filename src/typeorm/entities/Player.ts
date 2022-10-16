import { Column, Entity, PrimaryColumn } from "typeorm";


// https://www.tutorialspoint.com/typeorm/typeorm_entity.htm

@Entity({name: 'players'})
export class Player {

	@PrimaryColumn()
	id: number;

	@PrimaryColumn()
	username: string;

	@Column()
	avatar: string;

	@Column({default: 0})
	wins: number;

	@Column({default: 0})
	loses: number;

	@Column({default: false})
	twofa: boolean;
}