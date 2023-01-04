import axios from "axios";
import { error } from "console";
import { useSnackbar } from "notistack";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSnackbarNotification } from "../../App";
import { socket } from "../../context/socket";
import './style.css'

interface User {
	id: number;
	username: string;
	avatar: File;
	avatar_src: string;
	wins: number;
	loses: number;
}

interface Avatars {
	id: number;
	avatar: string;
}

const Social: FC = () => {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [users, setUsers] = useState<User[]>([]);
	const [avatars, setAvatars] = useState<Avatars[]>([]);

	const [currentUser, setCurrentUser] = useState<User | null>(null);
	document.body.style.backgroundColor = "#474E68"; //very nice color

	//Getting the users details
	useEffect(() => {

		axios.get("http://localhost:3000/user", {withCredentials: true})
		.then(res => {
			setCurrentUser(res.data);
		})
		.catch((err) => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});

		axios.get("http://localhost:3000/user/all", {withCredentials: true})
		.then(res => {
			console.log(res.data);
			setUsers(res.data);
		})
		.catch((err) => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, []);

	// useEffect(() => {
	// 	socket.on('chat/refresh-friendships', () => {
	// 	});
	
	// 	return () => {
	// 	socket.off('chat/refresh-friendships')
	// 	}
	// })
	

	//Getting the avatars
	useEffect(() => {
		users.map(elem => {
			axios.get("http://localhost:3000/user/"+elem.id+"/avatar", {withCredentials: true, responseType: 'blob'})
			.then((res) => {
				const imageObjectURL = URL.createObjectURL(res.data);
				setAvatars(prev => [...prev, {id: elem.id, avatar: imageObjectURL}]);
			})
			.catch((err) => {
				if (err.response.data.statusCode === 401)
					navigate('/login');
				showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
			});
		})
	}, [users]);

	function goHome(){ navigate("/"); }

	function getUsers() {
		if (!currentUser) return <h1>Loading...</h1>;
		return users.map((user) => {
			if (user.id == currentUser.id) return;
			return (
				<div key={user.id} className='userblock'>
					<div className="avatarblock">
						<img
							className="avatar"
							src={avatars.find(elem => elem.id == user.id)?.avatar} 
							alt="avatar picture" />
					</div>
					<div className="data">
						<h1 className="username" onClick={() => {
							navigate('/profile?user=' + user.username)
						}}>{user.username}</h1>
						<h2 className="stats">{user.wins} Wins</h2>
						<h2 className="stats">{user.loses} Loses</h2>

					</div>
					<button className="follow" onClick={() => {
						axios.put('http://localhost:3000/social/' + user.id + '/follow', {}, {withCredentials: true})
						.then(e => {
							showSnackbarNotification(enqueueSnackbar, 'Now following ' + user.id, 'success');
						})
						.catch(err => {
							if (err.response.data.statusCode === 401)
								navigate('/login');
							showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
						})
					}}>add friend</button>
				</div>
			);
		});
	}

	return (
		<div className="socials">
			<div className="background"/>
			{/* <link rel="preload" href="./transfonter.org-20221214-233247/MinecraftTen.woff2" as="font" type="font/woff2"></link> */}
			{/* <img
				className="background"
			src={require("./background.jpg")} alt="" /> */}
			<img 
			className="header"
			src={require('./Logo.png')} alt="" />
			{/* <h1 className="header">Socials</h1> */}
			<button onClick={goHome}>Home</button>
				{getUsers()}
		</div>
	);
}

export default Social;
