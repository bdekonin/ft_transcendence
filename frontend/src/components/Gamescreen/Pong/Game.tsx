import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showSnackbarNotification } from '../../../App';
import { SocketContext } from '../../../context/socket';
import { Message } from '../../Chat/Messages/Messages';
import { Draw } from './draw';
import './style.css';

export interface Game {
	id: string;
	theme: Theme;
	left: Paddle;
	right: Paddle;
	ball: Ball;
	leftScore: number;
	rightScore: number;
}

export interface Paddle {
	readonly socket: string;
	readonly username: string;
	left: boolean;
	right: boolean;

	readonly x: number;
	y: number;

	readonly width: number;
	readonly height: number;
}

export interface Ball {
	readonly speed: number;

	x: number;
	y: number;
	xVel:number;
	yVel:number;

	readonly width: number;
	readonly height: number;
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

// This enum represents the available themes for the game
export enum Theme {
	// The classic theme
	CLASSIC,
	
	// The football theme
	FOOTBALL,

	// Space theme
	SPACE,
}


const Game: React.FC = () => {

	const socket = useContext(SocketContext);
	const [state, setState] = useState<STATE>(STATE.WAITING);
	const location = useLocation();
	const navigate = useNavigate();
	const [theme, setTheme] = useState<Theme>(Theme.CLASSIC);
	
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
	
	const [gameState, setGameState] = useState<Game>();
	const [ball, setBall] = useState<Ball>();
	const [winner, setWinner] = useState<string | null>(null);
	const [draw, setDraw] = useState<Draw | null>();


	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		if (socket) { /* Socket stuff */
			socket.on('chat/refresh-message', (payload: Message) => {
				/* Enable notification for that channel */
				if (payload.parent.type == 'PRIVATE')
					showSnackbarNotification(enqueueSnackbar, "New message from " + payload.sender.username, 'info');
				else
					showSnackbarNotification(enqueueSnackbar, "New message in groupchat \'" + payload.parent.name + "\'", 'info');
			});
		}
		return () => {
			socket.off('chat/refresh-message');
		}
	}, [socket]);

	useEffect(() => {
		if (!draw) {
			if (canvasRef.current && context.current) {
				setDraw(new Draw(canvasRef.current.height, canvasRef.current.width));
			}
		}
	}, [canvasRef]);

	useEffect(() => {
		if (location.hash) {
			/* User wants to spectate a game */
			socket.emit("game/request-spectate", {id: location.hash.substring(1)});
			socket.on('game/spectate', (data: Game) => {
				setGameState(data);
				setBall(data.ball)
				setState(STATE.SPECTATOR);
			});
		}

		if (location.search) {
			/* User has invited a game or joined? */
			const values = location.search.split('=');

			if (values[0] != '?invite')
				return ;
			
			socket.emit("game/invite-waiting", {id: values[1] });
			// socket.on('game/invite-start', (data: Game) => {

			// 	setGameState(data);
			// 	setBall(data.ball)
			// 	setState(STATE.INTRO);
			// });
		}

		return () => {
			socket.off("game/spectate");
			socket.off("game/invite-start");
		}
	}, [socket]);

	useEffect(() => {
		if (state == STATE.WAITING) {
			if (!location.search) {
				socket.emit("game/waiting");
			}
		}
		socket.on("game/start", (data: Game) => {
			setGameState(data);
			setBall(data.ball)
			if (state != STATE.SPECTATOR) {
				setState(STATE.INTRO);
			}
		});
		return () => {
			socket.off("game/start");
			socket.emit("game/leave");
		};
	}, [socket]);

	useEffect(() => {
		socket.on('game/rejoin', (data: Game) => {
			setGameState(data);
			setBall(data.ball)
			if (state != STATE.SPECTATOR) {
				setState(STATE.PLAYING);
			}
		});
		return () => {
			socket.off("game/rejoin");
		}
	}, [socket]);

	useEffect(() => {
		socket.on("game/update", (data: Game) => {
			/* Update game state */
			setGameState(data);
			if (state != STATE.SPECTATOR) {
				if (socket.id == data.left.socket || socket.id == data.right.socket)
					setState(STATE.PLAYING);
			}
		});
		return () => {
			socket.off("game/update");
		};
	}, [socket]);

	useEffect(() => {
		socket.on("game/ball", (data: Ball) => {
			setBall(data);
		});
		return () => {
			socket.off("game/ball");
		};
	}, [socket]);
	
	useEffect(() => {
		socket.on("game/end", (payload?: any) => {
			if (payload) {
				setWinner(payload.winner);
			}
			setState(STATE.END);
		});
		return () => {
			socket.off("game/end");
		};
	}, [socket]);

	/* Mouse move handler */
	const mouseMoveHandler = useCallback(
		(e: MouseEvent) => {
			if (typeof gameState != "undefined" && state == STATE.PLAYING) {
				socket.emit("game/move", {y: e.clientY, id: gameState.id});
			}
		},
		[socket, state, gameState]
	);

	useEffect(() => {
		window.addEventListener("mousemove", mouseMoveHandler, false);
		return () => {
			window.removeEventListener("mousemove", mouseMoveHandler, false);
		};
	}, [mouseMoveHandler]);

	const [count, setCount] = useState(10);

	// define an effect that decrements the count every second
	useEffect(() => {
		const interval = setInterval(() => {
			if (state == STATE.INTRO) {
				if (count <= 0) {
					setState(STATE.PLAYING);
					setCount(10);
					return ;
				}
				setCount(count - 1);
			}
			if (state == STATE.END) {
				if (count <= 0) {
					clearInterval(interval);
					navigate("/");
					return ;
				}
				setCount(count - 1);
			}
		}, 1000);
	
		// return a cleanup function to stop the interval when the component unmounts
		return () => clearInterval(interval);
	}, [count, state, navigate]);


	/* Render next frame */
	const render = () => {
		if (!canvasRef.current || !context.current)
			return;
		if (!draw)
			return;
		if (state == STATE.WAITING) {
			draw.drawWaiting(theme, canvasRef.current, context.current)
		}
		if (state == STATE.INTRO && gameState) {
			draw.drawIntro(theme, count, socket.id, {
				context: context.current,
				canvas: canvasRef.current,
				gameState: gameState,
			});
		}
		else if ((state == STATE.SPECTATOR || state == STATE.PLAYING) && gameState && ball) {
			draw.drawPlaying(theme, ball, {
				context: context.current,
				canvas: canvasRef.current,
				gameState: gameState,
			});
		}
		else if (state == STATE.END && gameState && winner) {
			draw.drawEnd(theme, count, winner, {
				context: context.current,
				canvas: canvasRef.current,
				gameState: gameState,
			});
		}
	};

	const update = () => {
		if ((state == STATE.SPECTATOR || state == STATE.PLAYING) && gameState && ball) {
			//check top canvas bounds
			if(ball.y < 10){
				ball.yVel = 1;
			}

			//check bottom canvas bounds
			if(ball.y + ball.height > 400 - 10){
				ball.yVel = -1;
			}

			//check left canvas bounds
			if(ball.x < 0){
				if (state == STATE.PLAYING)
					socket.emit("game/score", {side: "right", id: gameState.id});
			}

			//check right canvas bounds
			if(ball.x + ball.width > 700){
				if (state == STATE.PLAYING)
					socket.emit("game/score", {side: "left", id: gameState.id});
			}

			//check left player collision
			if(ball.x <= gameState.left.x + gameState.left.width + 10){
				if(ball.y >= gameState.left.y && ball.y + ball.height <= gameState.left.y + gameState.left.height){
					ball.xVel = 1;
				}
			} 

			//check right player collision
			if(ball.x + ball.width >= gameState.right.x){
				if(ball.y >= gameState.right.y && ball.y + ball.height <= gameState.right.y + gameState.right.height){
					ball.xVel = -1;
				}
			}
			ball.x += ball.xVel * ball.speed;
			ball.y += ball.yVel * ball.speed;
		}
	};

	const requestIdRef = useRef<number>(0);
	const tick = () => {
		render();
		update();
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

	const handleChange = (event: SelectChangeEvent<number>, child: ReactNode) => {
		if (event.target.value === Theme.CLASSIC) {
			setTheme(Theme.CLASSIC);
		} else if (event.target.value === Theme.FOOTBALL) {
			setTheme(Theme.FOOTBALL);
		}
		else if (event.target.value === Theme.SPACE) {
			setTheme(Theme.SPACE);
		}
	};

	return (
		<div>
			<canvas
				ref={canvasRef}
				width={700}
				height={400}
				className="pong-canvas"
				style={{ border: "1px solid white" }}
			/>
			<FormControl variant="outlined">
			<InputLabel id="demo-simple-select-label">Theme</InputLabel>
			<Select
				labelId="demo-simple-select-label"
				id="demo-simple-select"
				defaultValue={theme}
				value={theme}
				label="Theme"
				onChange={handleChange}
			>
				<MenuItem value={Theme.CLASSIC}>Classic</MenuItem>
				<MenuItem value={Theme.FOOTBALL}>Football</MenuItem>
				<MenuItem value={Theme.SPACE}>Space</MenuItem>
			</Select>
			</FormControl>
		</div>
	  );
}

export default Game;
