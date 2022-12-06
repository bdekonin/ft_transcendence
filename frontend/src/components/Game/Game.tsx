import { drawerClasses } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../context/socket';
import './style.css'

interface Game {
	id: string;
	left: Paddle;
	right: Paddle;
}

interface Paddle {
	readonly socket: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;
}

const Game: React.FC = () => {

	/* Canvas */
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const context = useRef<CanvasRenderingContext2D | null>();

	const getCanvasContext = () => {
		if (!canvasRef.current) {
		  return;
		}
		context.current = canvasRef.current.getContext("2d");
	  };
	
	useEffect(getCanvasContext, []);
	
	const socket = useContext(SocketContext);
	const [isWaiting, setIsWaiting] = useState<boolean>(true);
	const [gameState, setGameState] = useState<Game>();

	useEffect(() => {
		if (isWaiting) {
			socket.emit("game/waiting");
		}
		socket.on("game/start", (data: Game) => {
			setGameState(data);
			setIsWaiting(false);
		});
		return () => {
		  socket.off("game/start");
		};
	}, [socket]);

	useEffect(() => {
		socket.on("game/update", (data: Game) => {
			setGameState(data);
			setIsWaiting(false);
		});
		return () => {
		  socket.off("game/update");
		};
	}, [socket]);

	/* Capture user inputs */
	const keyDownHandler = useCallback(
		(e: KeyboardEvent) => {
		if (typeof gameState != "undefined" && !isWaiting) {
				if (e.key === "Down" || e.key === "ArrowDown") {
					socket.emit("game/down", {press: true, id: gameState.id});
				} else if (e.key === "Up" || e.key === "ArrowUp") {
					socket.emit("game/up", {press: true, id: gameState.id});
				}
			}
		},
		[socket, isWaiting, gameState]
	);
	const keyUpHandler = useCallback(
		(e: KeyboardEvent) => {
			if (typeof gameState != "undefined" && !isWaiting) {
				if (e.key === "Down" || e.key === "ArrowDown") {
					socket.emit("game/down", {press: false, id: gameState.id});
				} else if (e.key === "Up" || e.key === "ArrowUp") {
					socket.emit("game/up", {press: false, id: gameState.id});
				}
			}
		},
		[socket, isWaiting, gameState]
	);

	useEffect(() => {
		window.addEventListener("keydown", keyDownHandler, false);
		return () => {
			window.removeEventListener("keydown", keyDownHandler, false);
		};
	}, [keyDownHandler]);

	useEffect(() => {
		window.addEventListener("keyup", keyUpHandler, false);
		return () => {
			window.removeEventListener("keyup", keyUpHandler, false);
		};
	}, [keyUpHandler]);


	/* Render next frame */
	const renderFrame = () => {
		if (!canvasRef.current || !context.current) return;
		if (gameState) {
			context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			context.current.fillStyle = "white";
			context.current.fillRect(gameState.left.x, gameState.left.y, gameState.left.width, gameState.left.height);
			context.current.fillStyle = "red";
			context.current.fillRect(gameState.right.x, gameState.right.y, gameState.right.width, gameState.right.height);
			context.current.fillRect(gameState.left.x, gameState.left.y, gameState.left.width, gameState.left.height);
		}
	};


	const requestIdRef = useRef<number>(0);
	const tick = () => {
		renderFrame();
		if (requestIdRef.current) {
			requestIdRef.current = requestAnimationFrame(tick);
		}
	};
	
	/* Launch game + cleanup */
	useEffect(() => {
		requestIdRef.current = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(requestIdRef.current);
		};

	});

	if (isWaiting) {
		return (
			<div>
				<h1>Waiting for other player...</h1>
			</div>
		);
	}
	return (
		<div className="container">
			<canvas ref={canvasRef} height={600} width={1300} id="game-canvas"></canvas>
		</div>
	)
}
export default Game;
