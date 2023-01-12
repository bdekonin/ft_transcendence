import axios from "axios";
import { useSnackbar } from "notistack";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSnackbarNotification } from "../../App";
import { socket } from "../../context/socket";
import { handleFollow, handleUnfollow } from "../Chat/Players/ButtonHandlers";
import './style.css';

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

type Friendship = {
	user: User;
	status: string;
	sender: User;
}

const Social: FC = () => {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [users, setUsers] = useState<User[]>([]);
	const [avatars, setAvatars] = useState<Avatars[]>([]);
	const [friendships, setFriendships] = useState<Friendship[]>([]);

	const [currentUser, setCurrentUser] = useState<User | null>(null);
	document.body.style.backgroundColor = "#474E68"; //very nice color

	//Getting the users details
	useEffect(() => {

		axios.get("http://" + "f1r3s17" + ":3000/user", {withCredentials: true})
		.then(res => {
			setCurrentUser(res.data);
		})
		.catch((err) => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});

		axios.get("http://" + "f1r3s17" + ":3000/user/all", {withCredentials: true})
		.then(res => {
			setUsers(res.data);
		})
		.catch((err) => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, []);

	useEffect(() => {
		if (!currentUser)
			return ;

		axios.get("http://" + "f1r3s17" + ":3000/social", { withCredentials: true })
		.then(res => {
			// parse data
			const parsedData: Friendship[] = res.data.map((friendship: any) => {
				const otherUser = friendship.sender.id == currentUser.id ? friendship.reciever : friendship.sender;
				return {
					status: friendship.status,
					user: otherUser,
					sender: friendship.sender,
				}
			});
			setFriendships(parsedData);
		})
		.catch((err) => {
			if (err.response.data.statusCode === 401)
				navigate('/login');
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, [currentUser])
	

	useEffect(() => {
		if (!currentUser)
			return ;
		socket.on('chat/refresh-friendships', () => {
			axios.get("http://" + "f1r3s17" + ":3000/social", { withCredentials: true })
			.then(res => {
				// parse data
				const parsedData: Friendship[] = res.data.map((friendship: any) => {
					const otherUser = friendship.sender.id == currentUser.id ? friendship.reciever : friendship.sender;
					return {
						status: friendship.status,
						user: otherUser,
						sender: friendship.sender,
					}
				});
				setFriendships(parsedData);
			})
		});
	
		return () => {
			socket.off('chat/refresh-friendships')
		}
	})
	

	//Getting the avatars
	useEffect(() => {
		users.map(elem => {
			axios.get("http://" + "f1r3s17" + ":3000/user/"+elem.id+"/avatar", {withCredentials: true, responseType: 'blob'})
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

		/* Sort users by wl ratio */
		users.sort((a, b) => {
			const a_wl = a.wins / (a.wins + a.loses);
			const b_wl = b.wins / (b.wins + b.loses);
			return b_wl > a_wl ? -1 : 1;
		});
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
							alt="avatar picture"
							onClick={() => {
								navigate('/profile?user=' + user.username)
							}}/>
					</div>
					<div className="data">
						<h1 className="username">{user.username}</h1>
						<h2 className="stats">{user.wins} Wins</h2>
						<h2 className="stats">{user.loses} Loses</h2>
						<h2 className="stats">{!user.wins && !user.loses ? '0' : user.wins / user.loses } W/L</h2>
					</div>
					{render_follow_unfollow(user)}
				</div>
			);
		});
	}

	/**
	 * Function to check if a user has a certain friendship status
	 * 
	 * @param {string} isWhat - The desired friendship status to check for
	 * @param {User} user - The user to check the friendship status of
	 * 
	 * @return {boolean} - Returns true if the user has the desired friendship status, false otherwise
	*/
	function isAlready(isWhat: string, user: User): boolean {
		const friendship = friendships.find(friendship => friendship.user.id == user.id);
		if (friendship)
			return friendship.status == isWhat;
		return false;
	}
	function isSender(user: User): boolean {
		const friendship = friendships.find(friendship => friendship.user.id == user.id);
		if (friendship)
			return friendship.sender.id == currentUser?.id;
		return false;
	}

	function render_follow_unfollow(user: User) {

		const isFriend = isAlready('accepted', user);
		const isPending = isAlready('pending', user);
		const isUserSender = isSender(user);

		if (isUserSender && isPending) {
			return (
				<button className="follow" onClick={() => { handleUnfollow(enqueueSnackbar, user) }}>Cancel</button>
			);
		}
		else if (isPending) {
			return (
				<>
					<button className="follow decline" onClick={() => { handleUnfollow(enqueueSnackbar, user) }}>Decline</button>
					<button className="follow accept" onClick={() => { handleFollow(enqueueSnackbar, user) }}>Accept</button>
				</>
			);
		}

		if (isFriend) {
			return (
				<button className="follow" onClick={() => { handleUnfollow(enqueueSnackbar, user) }}>Unfollow</button>
			);
		}

		return (
			<button className="follow" onClick={() => { handleFollow(enqueueSnackbar, user) }}>Follow</button>
		);
	}

	return (
		<div className="socials">
			<div className="background"/>
			<img 
			className="header"
			src={require('./Logo.png')} alt="" />
			<button onClick={goHome}>Home</button>
				{getUsers()}
		</div>
	);
}

export default Social;
