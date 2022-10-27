import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

export enum UserRole {
	OWNER = 'owner',
	ADMIN = 'admin',
	USER = 'user',
}

@Entity()
export class Membership {
	@PrimaryGeneratedColumn()
	id: number

	@OneToOne(() => User, (user) => user.membership)
	user: User; // extends to .role .banned .muted

	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole; // owner admin user...

	@Column({ default: false })
	banned: boolean; // is banned?

	@Column({ default: false })
	muted: boolean; // is muted?
}