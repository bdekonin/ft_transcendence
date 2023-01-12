import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showSnackbarNotification } from "../../App";
import { hostname } from "../../context/host";
import './style.css';

interface Game {
	id: number;
	mode: string;
	winner: User;
	loser: User;
	draw: boolean;
	winnerScore: number;
	loserScore: number;
	createdAt: string;
}

interface User {
	id: number;
	username: string;
	avatar: string;
	level: string;
	wins: string;
	loses: string;
// chats*	{...}
	createdAt: string;
}

interface Avatar {
	id: number;
	avatar: string;
}


const Profile:React.FC = () =>
{
	const navigate = useNavigate();
	const [user, setUser] = useState<User>();
	const [avatar, setAvatar] = useState<Avatar>();
	let [searchParams, setSearchParams] = useSearchParams();
	const [games, setGames] = useState<Game[]>();
	const [friendAmount, setFriendAmount] = useState<number>(0);
	const [status, setStatus] = useState<string>('');
	
	const query = searchParams.get('user');
	const { enqueueSnackbar } = useSnackbar();

	/* For user object */
	useEffect(() => {
		axios.get('http://' + hostname + ':3000/user/' + (query ? query : ''), { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, [searchParams]);

	//getting the Avatars
	useEffect(() => {
		if (user) {
			axios.get("http://" + "f1r3s17" + ":3000/user/" + user?.id + "/avatar", { withCredentials: true, responseType: 'blob'})
			.then(res => {
				const imageObjectURL = URL.createObjectURL(res.data);
				setAvatar({id: user?.id as number, avatar: imageObjectURL});
			})
			.catch(err => {
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			});
			axios.get('http://' + hostname + ':3000/game/userID/' + user?.id, { withCredentials: true })
			.then(res => {
				setGames(res.data);
				games?.sort((a, b) => {
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				});
			})
			.catch(err => {
				if (err.response.data.statusCode === 401)
					navigate('/login');
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			});

			axios.get('http://' + hostname + ':3000/social/' + user.id, { withCredentials: true })
			.then(res => {
				setFriendAmount(res.data.length);
			})
			.catch(err => {
				if (err.response.data.statusCode === 401)
					navigate('/login');
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			});

			axios.get('http://' + hostname + ':3000/user/' + user.id + '/status', { withCredentials: true })
			.then(res => {
				setStatus(res.data);
			})
			.catch(err => {
				if (err.response.data.statusCode === 401)
					navigate('/login');
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			});
		}
	}, [user]);


	function gameRow(game: Game)
	{
		// string to int
		var class_name = game.winner.id === user?.id ? 'won' : 'lost';
		if (game?.draw == true)
			class_name = 'draw';
		return (
				<tr key={game.id} className={class_name}>
					<td>{game.id}</td>
					<td>{game.mode}</td>
					<td className="clickable" onClick={() => {navigate('/profile?user=' + game.winner.username)}}>{game.winner.username}</td>
					<td className="clickable" onClick={() => {navigate('/profile?user=' + game.loser.username)}}>{game.loser.username}</td>
					<td>{game.winnerScore}</td>
					<td>{game.loserScore}</td>
					<td>{new Date(parseInt(game.createdAt)).toUTCString()}</td>
				</tr>
		);
	}

	function renderLastOnline() {
		if (status) {
			return <span className="online">{status}</span>;
		}
		else
			return <p>Loading...</p>
	}


	return (
		<div className="profile">
			<div className="background"/>
			<h1>{user?.username}</h1>
			<div className="profileblock">
				<img
					className="avatar"
					src={avatar?.avatar} alt="" />
			</div>
			<button onClick={() => {navigate('/')}}>Home</button>
			<div className='last-online'>
				{renderLastOnline()}
			</div>
			<div className='friend-href'>
				<ul>
					<li>
						<a>Friends {friendAmount}</a> 
					</li>
				</ul>
			</div>
			<div className='stats'>
				<h3>Stats</h3>
				<p>Wins: {user?.wins}</p>
				<p>Loses: {user?.loses}</p>
			</div>
			<div className='games'>
				<table>
					<h1>Game History</h1>
					<tr>
						<th>#</th>
						<th>Mode</th>
						<th>Winner</th>
						<th>Loser</th>
						<th>Winner score</th>
						<th>Loser score</th>
						<th>Date</th>
					</tr>
					{ games?.map(game => gameRow(game)) }
				</table>
			</div>
		</div>
	);
}
export default Profile;