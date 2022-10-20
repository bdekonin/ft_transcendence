import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
	OWNER = 'owner',
	ADMIN = 'admin',
	USER = 'user',
}

@Entity()
export class Membership {
	@PrimaryGeneratedColumn()
	id: number

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