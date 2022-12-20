import { Entity } from "typeorm";

@Entity()
export class Ban {
	id: number; /* ID of user */
	unbannedTime: string; /* Time of unban */
}