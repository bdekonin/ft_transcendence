import { drawInterface } from "../draw";
import { Ball } from "../Game";



/* Private functions, not accessible outside of this file */
export function drawWaitingForClassicTheme(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.font = "30px Arial Narrow";
	context.fillStyle = "white";
	const prompt = "Waiting for other player...";
	const promptWidth = context.measureText(prompt).width;
	context.fillText(prompt, (canvas.width / 2) - (promptWidth / 2), canvas.height / 2);
}
export function drawIntroForClassicTheme(i: number, socketID: string, dto: drawInterface) {
	dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	if (i > 5) {
		const username = dto.gameState.left.socket != socketID ? dto.gameState.left.username : dto.gameState.right.username;
		const prompt = "Playing against " + username;
		const promptWidth = dto.context.measureText(prompt).width;
		dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 2);
	}
	else if (i > 3) {
		const prompt = "Ready?";
		const promptWidth = dto.context.measureText(prompt).width;
		dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 2);
	}
	else {
		const prompt = i.toString();
		const promptWidth = dto.context.measureText(prompt).width;
		dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 2);
	}
}
export function drawPlayingForClassicTheme(ball: Ball, dto: drawInterface) {
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
export function drawEndForClassicTheme(winner: string, i:number, dto: drawInterface) {
	dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	if (!winner) {
		const prompt = "Draw!";
		const promptWidth = dto.context.measureText(prompt).width;
		dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 3);
		return;
	}
	const prompt = "Winner: " + winner;
	const promptWidth = dto.context.measureText(prompt).width;
	dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), dto.canvas.height / 3);

	/* Sending the user back to the lobby after 5 seconds */
	if (i > 1) {
		const prompt = "Sending you back to the lobby in " + (i).toString() + " seconds";
		const promptWidth = dto.context.measureText(prompt).width;
		dto.context?.fillText(prompt, (dto.canvas.width / 2) - (promptWidth / 2), (dto.canvas.height / 3) * 2);
	}
}
