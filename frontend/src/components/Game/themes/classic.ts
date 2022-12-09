import { drawInterface } from "../draw";
import { Ball } from "../Game";



/* Private functions, not accessible outside of this file */
export function drawWaitingForClassicTheme(context: CanvasRenderingContext2D) {
	context.font = "30px Arial Narrow";
	context.fillStyle = "white";
	context.fillText("Waiting for other player...", 200, 200);
}
export function drawIntroForClassicTheme(i: number, socketID: string, dto: drawInterface) {
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
export function drawEndForClassicTheme(winner: string, dto: drawInterface) {
	dto.context.clearRect(0, 0, dto.canvas.width, dto.canvas.height);
	dto.context.font = "30px Arial Narrow";
	dto.context.fillStyle = "white";
	if (!winner) {
		dto.context?.fillText("Draw!", dto.canvas.width / 2 - 50, dto.canvas.height / 2);
		return;
	}
	dto.context?.fillText("Winner: " + winner, dto.canvas.width / 2 - 100, dto.canvas.height / 2);
}
