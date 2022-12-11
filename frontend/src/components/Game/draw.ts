import { Ball, Game, Theme } from "./Game";
import { Classic } from "./themes/classic";
import { Football } from "./themes/football";
import { Space } from "./themes/space";

/* This function makes it easier to store the variables */
export interface drawInterface {
	context: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	gameState: Game;
}

export class Draw {

	// private christmasBackgroundImage: HTMLImageElement;
	private classicTheme: Classic;
	private footballTheme: Football;
	private spaceTheme: Space;

	private width: number;
	private height: number;

	constructor(width: number, height: number) {

		this.width = width;
		this.height = height;

		this.classicTheme = new Classic();
		this.footballTheme = new Football();
		this.spaceTheme = new Space();
	}

	drawWaiting(theme: Theme, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		/* Will alwasy be classic theme, or choose random?? */
		if (theme == Theme.CLASSIC) {
			this.classicTheme.drawWaiting(canvas, context);
		}
		else if (theme == Theme.FOOTBALL) {
			this.footballTheme.drawWaiting(canvas, context);
		}
		else if (theme == Theme.SPACE) {
			this.spaceTheme.drawWaiting(canvas, context);
		}
	}
	drawIntro(theme: Theme, i: number, socketID: string, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		if (theme == Theme.CLASSIC) {
			this.classicTheme.drawIntro(i, socketID, dto);
		}
		else if (theme == Theme.FOOTBALL) {
			this.footballTheme.drawIntro(i, socketID, dto);
		}
		else if (theme == Theme.SPACE) {
			this.spaceTheme.drawIntro(i, socketID, dto);
		}
	}
	drawPlaying(theme: Theme, ball: Ball, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		if (theme == Theme.CLASSIC) {
			this.classicTheme.drawPlaying(ball, dto);
		}
		else if (theme == Theme.FOOTBALL) {
			this.footballTheme.drawPlaying(ball, dto);
		}
		else if (theme == Theme.SPACE) {
			this.spaceTheme.drawPlaying(ball, dto);
		}
	}
	drawEnd(theme: Theme, i: number, winner: string, dto: drawInterface) {
		if (theme == Theme.CLASSIC) {
			this.classicTheme.drawEnd(winner, i, dto);
		}
		else if (theme == Theme.FOOTBALL) {
			this.footballTheme.drawEnd(winner, i, dto);
		}
		else if (theme == Theme.SPACE) {
			this.spaceTheme.drawEnd(winner, i, dto);
		}
	}
}
