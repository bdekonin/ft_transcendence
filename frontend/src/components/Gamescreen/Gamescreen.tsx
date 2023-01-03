import { useNavigate } from 'react-router-dom';
import Spectate from './Spectate/Spectate';
import './style.css'




const Gamescreen: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="row">
			<div className="column">
				<h1>Play game</h1>
				<button
					onClick={() => {
						navigate('/pong');
					}}
				>Play Game</button>
			</div>
			<div className="column">
				<h1>Currently played games</h1>
				<Spectate />
			</div>
		</div>
	);
}
export default Gamescreen;