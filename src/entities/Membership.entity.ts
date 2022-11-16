import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
	OWNER = 'owner',
	ADMIN = 'admin',
	USER = 'user',
}

@Entity()
export class Membership {

	@ApiProperty({ description: 'The id of the membership', example: 1 })
	@PrimaryGeneratedColumn()
	id: number

	@ApiProperty({ description: 'The user it belongs too', type: () => User })
	@OneToOne(() => User, (user) => user.membership)
	user: User; // extends to .role .banned .muted

	@ApiProperty({ description: 'The role of the user', example: 'user' })
	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole; // owner admin user...

	@ApiProperty({ description: 'if the user is banned', example: false })
	@Column({ default: false })
	banned: boolean; // is banned?

	@ApiProperty({ description: 'if the user is muted', example: false })
	@Column({ default: false })
	muted: boolean; // is muted?
}