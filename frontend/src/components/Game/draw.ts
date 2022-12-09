

interface Game {
	id: string;
	left: Paddle;
	right: Paddle;
	ball: Ball;
	leftScore: number;
	rightScore: number;
}

interface Paddle {
	readonly socket: string;
	readonly username: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;
}

interface Ball {
	readonly speed: number;

	x: number;
	y: number;
	xVel:number;
	yVel:number;

	readonly width: number;
	readonly height: number;
}

// This enum represents the available themes for the game
export enum Theme {
	// The classic theme
	CLASSIC,
	
	// The football theme
	FOOTBALL,
}

// This enum represents the possible states of the game
export enum STATE {
	// The spectator state, where the user is watching the game but not participating
	SPECTATOR,
	
	// The default state, where the user is waiting for the game to start
	WAITING,
	
	// The intro animation state, where the game is playing the intro animation
	INTRO,
	
	// The playing state, where the user is actively participating in the game
	PLAYING,
	
	// The end of game state, where the game is over and the user is no longer participating
	END
}


/* This function makes it easier to store the variables */
export interface drawInterface {
	context: CanvasRenderingContext2D;
	canvas: HTMLCanvasElement;
	gameState: Game;
}


/* This function is called by the Game component to draw the game */
export function drawWaiting(context: CanvasRenderingContext2D) {
	/* Call the appropriate function based on the theme */
	drawWaitingForClassicTheme(context);
}

export function drawIntro(theme: Theme, i: number, socketID: string, dto: drawInterface) {
	/* Call the appropriate function based on the theme */
	if (theme == Theme.CLASSIC) {
		drawIntroForClassicTheme(i, socketID, dto);
	}
	else if (theme == Theme.FOOTBALL) {
		drawIntroForClassicTheme(i, socketID, dto);
		// drawIntroForFootballTheme(i, dto);
	}
}

export function drawPlaying(theme: Theme, ball: Ball, dto: drawInterface) {
	/* Call the appropriate function based on the theme */
	if (theme == Theme.CLASSIC) {
		drawPlayingForClassicTheme(ball, dto);
	}
	else if (theme == Theme.FOOTBALL) {
		drawPlayingForFootballTheme(ball, dto);
	}
}

export function drawEnd(theme: Theme, winner: string, dto: drawInterface) {
	/* Call the appropriate function based on the theme */
	if (theme == Theme.CLASSIC) {
		drawEndForClassicTheme(winner, dto);
	}
	else if (theme == Theme.FOOTBALL) {
		drawEndForClassicTheme(winner, dto);
		// drawEndForFootballTheme(dto);
	}
}



/* Private functions, not accessible outside of this file */
function drawWaitingForClassicTheme(context: CanvasRenderingContext2D) {
	context.font = "30px Arial Narrow";
	context.fillStyle = "white";
	context.fillText("Waiting for other player...", 200, 200);
}
function drawIntroForClassicTheme(i: number, socketID: string, dto: drawInterface) {
	dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	if (i > 5) {
		const username = dto.gameState.left.socket != socketID ? dto.gameState.left.username : dto.gameState.right.username;
		dto.context?.fillText("Playing against " + username, dto.canvas.width / 2 - 100, dto.canvas.height / 2);
	}
	else if (i > 3) {
		dto.context?.fillText("Ready?", dto.canvas.width / 2 - 50, dto.canvas.height / 2);
	}
	else {
		dto.context?.fillText(i.toString(), dto.canvas.width / 2 - 10, dto.canvas.height / 2);
	}
}
function drawPlayingForClassicTheme(ball: Ball, dto: drawInterface) {
	/* Paddles */
	dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
	dto.context.fillStyle = "white";
	dto.context.fillRect(dto.gameState.left.x, dto.gameState.left.y, dto.gameState.left.width, dto.gameState.left.height);
	dto.context.fillStyle = "white";
	dto.context.fillRect(dto.gameState.right.x, dto.gameState.right.y, dto.gameState.right.width, dto.gameState.right.height);
	dto.context.fillRect(dto.gameState.left.x, dto.gameState.left.y, dto.gameState.left.width, dto.gameState.left.height);

	/* Draw middle dotted line */
	dto.context.beginPath();
	for (let i = 0; i < dto.canvas.height; i += 30) {
		dto.context.moveTo(dto.canvas.width / 2, i);
		dto.context.lineTo(dto.canvas.width / 2, i + 15);
	}
	dto.context.strokeStyle = "white";
	dto.context.lineWidth = 2;
	dto.context.stroke();

	/* Score */
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	dto.context?.fillText(dto.gameState.leftScore.toString(), 300, 40); /* Left */
	dto.context?.fillText(dto.gameState.rightScore.toString(), 390, 40); /* Right */

	/* Ball */
	dto.context.beginPath();
	dto.context.arc(ball.x, ball.y, ball.height, 0, Math.PI * 2);
	dto.context.fillStyle = "white";
	dto.context.fill();
}
function drawEndForClassicTheme(winner: string, dto: drawInterface) {
	dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	if (!winner) {
		dto.context?.fillText("Draw!", dto.canvas.width / 2 - 50, dto.canvas.height / 2);
		return;
	}
	dto.context?.fillText("Winner: " + winner, dto.canvas.width / 2 - 100, dto.canvas.height / 2);
}


function drawWaitingForFootballTheme() {
	// ...
}
function drawIntroForFootballTheme() {
	// ...
}
function drawPlayingForFootballTheme(ball: Ball, dto: drawInterface) {

	drawFootballPitch(dto.context, dto.canvas);

	/* Paddles */
	dto.context.fillStyle = "white";
	dto.context.fillRect(dto.gameState.left.x, dto.gameState.left.y, dto.gameState.left.width, dto.gameState.left.height);
	dto.context.fillStyle = "white";
	dto.context.fillRect(dto.gameState.right.x, dto.gameState.right.y, dto.gameState.right.width, dto.gameState.right.height);
	dto.context.fillRect(dto.gameState.left.x, dto.gameState.left.y, dto.gameState.left.width, dto.gameState.left.height);


	/* Score */
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	dto.context?.fillText(dto.gameState.leftScore.toString(), 300, 40); /* Left */
	dto.context?.fillText(dto.gameState.rightScore.toString(), 390, 40); /* Right */

	/* Ball */
	dto.context.beginPath();
	dto.context.arc(ball.x, ball.y, ball.height, 0, Math.PI * 2);
	dto.context.fillStyle = "white";
	dto.context.fill();
}
function drawEndForFootballTheme() {
	// ...
}

function drawFootballPitch(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
	// Outer lines
	ctx.beginPath();
	ctx.rect(0,0, canvas.width, canvas.height);
	ctx.fillStyle = "#060";
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#FFF";
	ctx.stroke();
	ctx.closePath();

	ctx.fillStyle = "#FFF";

	// Mid line
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, 0);
	ctx.lineTo(canvas.width / 2, canvas.height);
	ctx.stroke();
	ctx.closePath();

	//Mid circle
	ctx.beginPath()
	ctx.arc(canvas.width / 2, canvas.height / 2, 73, 0, 2*(Math.PI), false);
	ctx.stroke();
	ctx.closePath();

	//Mid point
	ctx.beginPath()
	ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, 2*Math.PI, false);
	ctx.fill();
	ctx.closePath();

	//Home penalty box
	ctx.beginPath();
	ctx.rect(0, (canvas.height - 322) / 2, 132, 322);
	ctx.stroke();
	ctx.closePath();

	//Home goal box
	ctx.beginPath();
	ctx.rect(0, (canvas.height - 146) / 2, 44, 146);
	ctx.stroke();
	ctx.closePath();

	// //Home goal 
	// ctx.beginPath();
	// ctx.moveTo(1, (canvas.height / 2) - 22);
	// ctx.lineTo(1, (canvas.height / 2) + 22);
	// ctx.lineWidth = 2;
	// ctx.stroke();
	// ctx.closePath();
	// ctx.lineWidth = 1;

	//Home penalty point
	ctx.beginPath()
	ctx.arc(88, canvas.height / 2, 1, 0, 2*Math.PI, true);
	ctx.fill();
	ctx.closePath();

	//Home half circle
	ctx.beginPath()
	ctx.arc(88, canvas.height / 2, 73, 0.29*Math.PI, 1.71*Math.PI, true);
	ctx.stroke();
	ctx.closePath();

	//Away penalty box
	ctx.beginPath();
	ctx.rect(canvas.width-132, (canvas.height - 322) / 2, 132, 322);
	ctx.stroke();
	ctx.closePath();

	//Away goal box
	ctx.beginPath();
	ctx.rect(canvas.width-44, (canvas.height - 146) / 2, 44, 146);
	ctx.stroke();
	ctx.closePath();

	// //Away goal 
	// ctx.beginPath();
	// ctx.moveTo(canvas.width-1, (canvas.height / 2) - 22);
	// ctx.lineTo(canvas.width-1, (canvas.height / 2) + 22);
	// ctx.lineWidth = 2;
	// ctx.stroke();
	// ctx.closePath();
	// ctx.lineWidth = 1;

	//Away penalty point
	ctx.beginPath()
	ctx.arc(canvas.width-88, canvas.height / 2, 1, 0, 2*Math.PI, true);
	ctx.fill();
	ctx.closePath();

	//Away half circle
	ctx.beginPath()
	ctx.arc(canvas.width-88, canvas.height / 2, 73, 0.71*Math.PI, 1.29*Math.PI, false);
	ctx.stroke();
	ctx.closePath();

	//Home L corner
	ctx.beginPath()
	ctx.arc(0, 0, 8, 0, 0.5*Math.PI, false);
	ctx.stroke();
	ctx.closePath();

	//Home R corner
	ctx.beginPath()
	ctx.arc(0, canvas.height, 8, 0, 2*Math.PI, true);
	ctx.stroke();
	ctx.closePath();

	//Away R corner
	ctx.beginPath()
	ctx.arc(canvas.width, 0, 8, 0.5*Math.PI, 1*Math.PI, false);
	ctx.stroke();
	ctx.closePath();

	//Away L corner
	ctx.beginPath()
	ctx.arc(canvas.width, canvas.height, 8, 1*Math.PI, 1.5*Math.PI, false);
	ctx.stroke();
	ctx.closePath();	
}