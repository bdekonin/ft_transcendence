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

	/**
	 * Draws the waiting screen for the game.
	 *
	 * @param canvas - The HTML canvas element on which to draw the waiting screen.
	 * @param context - The canvas rendering context used to draw the waiting screen.
	*/
	drawWaiting(theme: Theme, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		/* Will alwasy be classic theme, or choose random?? */
		if (theme === Theme.CLASSIC) {
			this.classicTheme.drawWaiting(canvas, context);
		}
		else if (theme === Theme.FOOTBALL) {
			this.footballTheme.drawWaiting(canvas, context);
		}
		else if (theme === Theme.SPACE) {
			this.spaceTheme.drawWaiting(canvas, context);
		}
	}

	/**
	 * Draws the intro screen for the game, showing the countdown before the game starts.
	 *
	 * @param i - The current countdown value to display.
	 * @param socketID - The ID of the socket connection.
	 * @param dto - An object containing the canvas, context, and game state used to draw the intro screen.
	*/
	drawIntro(theme: Theme, i: number, socketID: string, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		if (theme === Theme.CLASSIC) {
			this.classicTheme.drawIntro(i, socketID, dto);
		}
		else if (theme === Theme.FOOTBALL) {
			this.footballTheme.drawIntro(i, socketID, dto);
		}
		else if (theme === Theme.SPACE) {
			this.spaceTheme.drawIntro(i, socketID, dto);
		}
	}

	/**
	 * Draws the game screen while the game is in progress.
	 *
	 * @param ball - The ball object to draw.
	 * @param dto - An object containing the canvas, context, and game state used to draw the game screen.
	*/
	drawPlaying(theme: Theme, ball: Ball, dto: drawInterface) {
		/* Call the appropriate function based on the theme */
		if (theme === Theme.CLASSIC) {
			this.classicTheme.drawPlaying(ball, dto);
		}
		else if (theme === Theme.FOOTBALL) {
			this.footballTheme.drawPlaying(ball, dto);
		}
		else if (theme === Theme.SPACE) {
			this.spaceTheme.drawPlaying(ball, dto);
		}
	}

	/**
	 * Draws the end screen for the game, showing the winner and a countdown until the user get sent back to the homescreen.
	 *
	 * @param winner - The ID of the socket connection that won the game.
	 * @param i - The current countdown value to display.
	 * @param dto - An object containing the canvas, context, and game state used to draw the end screen.
	*/
	drawEnd(theme: Theme, i: number, winner: string, dto: drawInterface) {
		if (theme === Theme.CLASSIC) {
			this.classicTheme.drawEnd(winner, i, dto);
		}
		else if (theme === Theme.FOOTBALL) {
			this.footballTheme.drawEnd(winner, i, dto);
		}
		else if (theme === Theme.SPACE) {
			this.spaceTheme.drawEnd(winner, i, dto);
		}
	}
}
