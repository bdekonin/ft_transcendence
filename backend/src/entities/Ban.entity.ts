import { Entity } from "typeorm";

@Entity()
export class UserAccess {
	id: number; /* ID of user */
	unbannedTime: string; /* Time of unban */
}