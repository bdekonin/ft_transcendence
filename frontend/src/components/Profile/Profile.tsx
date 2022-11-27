import axios from "axios";
import { stringify } from "querystring";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './style.css'

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
	const query = searchParams.get('user');
	// const [avatar, setAvatar] = useState<string>();
	const [games, setGames] = useState<Game[]>();
	const [friendAmount, setFriendAmount] = useState<number>(0);


	/* For user object */
	useEffect(() => {
		// console.log('Param user=' + searchParams.get('user'));
		axios.get('http://localhost:3000/user/' + (query ? query : ''), { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			navigate('/login');
		});
	}, [searchParams]);

	//getting the Avatars
	useEffect(() => {
		axios.get("http://localhost:3000/user/" + user?.id + "/avatar", { withCredentials: true, responseType: 'blob'})
		.then(res => {
			const imageObjectURL = URL.createObjectURL(res.data);
			setAvatar({id: user?.id as number, avatar: imageObjectURL});
		})
		.catch(err => {
			console.log(err);
		});
	}, [user]);

	/* For games */
	useEffect(() => {
		if (user) {
			axios.get('http://localhost:3000/game/userID/' + user?.id, { withCredentials: true })
			.then(res => {
				console.log(res);
				setGames(res.data);
				games?.sort((a, b) => {
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				});
			})
			.catch(err => {
				console.log(err);
				navigate('/login');
			});
		}
	}, [user]);

	/* For friends */
	useEffect(() => {
		if (user) {
			axios.get('http://localhost:3000/social/' + user?.id, { withCredentials: true })
			.then(res => {
				console.log(res);
				setFriendAmount(res.data.length);
			})
			.catch(err => {
				console.log(err);
				navigate('/login');
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
				{/* string to int */}
				<td>{new Date(parseInt(game.createdAt)).toUTCString()}</td>
			</tr>
		);
	}

	return (
		<div className="profile">
			<h1>Profile</h1>
			<div className='profile'>

				<img className="profile-pic" src={avatar?.avatar} alt="profile"></img>
				 <p>{user?.username}</p>
			</div>
			<div className='edit-profile'>
				<button>Edit Profile</button>
			</div>
			<div className='friend-href'>
				<ul>
					<li>
						<a href='/home'>Friends {friendAmount}</a> 
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
					<h4>all games</h4>
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