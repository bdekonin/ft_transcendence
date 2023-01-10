import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../../context/socket";
import Button from '@mui/material/Button';


interface SpectateProps {
	id: string; /* Id of the game to spectate */
	left: string; /* Name of the left player */
	right: string; /* Name of the right player */
}
const Spectate: React.FC =() => {
	const socket = useContext(SocketContext);
	const navigate = useNavigate();

	const [gameList, setGameList] = useState<SpectateProps[]>([]);

	useEffect(() => {
		socket.emit('game/spectate-list');
	}, [socket]);
	
	useEffect(() => {
		socket.on('game/spectate-list', (data: { [key: string]: SpectateProps }) => {
			setGameList(Object.values(data));
		});
	
		return () => {
			socket.off('game/spectate-list');
		};
	});


	return (
		<>
			{
				gameList.length > 0 ? (
					<>
						<h1>Games</h1>
						<ul>
							{
								gameList.map((game, index) => (
								<Button variant="contained"
									key={index}
									onClick={() => {
										navigate('/pong#' + game.id)
									}}
								>
									{game.left} vs {game.right}
								</Button>
								))
							}
						</ul>
					</>
				) : (
					<p>No active games</p>
				)
			}
		</>
	)
}
export default Spectate;