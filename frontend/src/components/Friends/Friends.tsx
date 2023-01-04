import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useCallback, useContext, useEffect, useState } from "react";
import './style.css'
import { SocketContext } from "../../context/socket";
import { useSnackbar } from "notistack";
import { showSnackbarNotification } from "../../App";

interface User {
	id: number;
	username: string;
	status: string;
	isReceiver: boolean;
}

interface Friend {
	id: number;
	sender: User;
	reciever: User;
	status: string;
}

interface Avatar {
	id: number;
	avatar: string;
}

const Friends:React.FC = () => {
	
	const socket = useContext(SocketContext);
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();
	const [user, setUser] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const [avatars, setAvatars] = useState<Avatar[]>([]);
	
	document.body.style.backgroundColor = "#474E68";
	function goHome(){ navigate("/"); }
	function goToProfile(otherUser: User) {	navigate('/profile?user=' + otherUser.username); }

	useEffect(() => {
		if (socket) { /* Socket stuff */
			socket.on('chat/refresh-message', (payload: any) => {
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

		if (!socket)
			return ;

		socket.on('chat/refresh-friendships', () => {
			axios.get('http://localhost:3000/social', {withCredentials: true})
			.then(res => {
				let friends: User[] = [];
				res.data.map((elem: Friend) => {
					let newUser: User;
					if (elem.sender.id === user?.id)
					{
						newUser = {
							id: elem.reciever.id,
							username: elem.reciever.username,
							status: elem.status,
							isReceiver: false,
						}
					}
					else
					{
						newUser = {
							id: elem.sender.id,
							username: elem.sender.username,
							status: elem.status,
							isReceiver: true,
						}
					}
					friends.push(newUser);
				})
				setUsers(friends);
			})
		});

		return (() => {
			socket.off('chat/refresh-friendships');
		})
	})

	useEffect(() => {
		axios.get('http://localhost:3000/user', {withCredentials: true})
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, [])

	useEffect(() => {
		if (user === undefined)
			return ;
		axios.get('http://localhost:3000/social', {withCredentials: true})
		.then(res => {
			let friends: User[] = [];
			res.data.map((elem: Friend) => {
				let newUser: User;
				if (elem.sender.id === user?.id)
				{
					newUser = {
						id: elem.reciever.id,
						username: elem.reciever.username,
						status: elem.status,
						isReceiver: false,
					}
				}
				else
				{
					newUser = {
						id: elem.sender.id,
						username: elem.sender.username,
						status: elem.status,
						isReceiver: true,
					}
				}
				friends.push(newUser);
			})
			setUsers(friends);
		})
		.catch(err => {
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		});
	}, [user])

	useEffect(() => {
		if (users === undefined)
			return ;
		users.map(elem => {
			if (!avatars.find(o => o.id === elem.id))
			{
				axios.get('http://localhost:3000/user/' + elem.id + '/avatar', {withCredentials: true, responseType: 'blob'})
				.then(res => {
					setAvatars(oldArr => [...oldArr, {id: elem.id, avatar: URL.createObjectURL(res.data)}]);
				})
				.catch(err => {
					showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
				});
			}
		})
	}, [users])

	function acceptFriend(otherUser: User) {
		axios.put('http://localhost:3000/social/' + otherUser.id + '/follow', {}, {withCredentials: true})
		.catch((err) => {
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		})
	}

	function denyFriend(otherUser: User) {
		axios.delete('http://localhost:3000/social/' + otherUser.id + '/unfollow', {withCredentials: true})
		.catch((err) => {
			showSnackbarNotification(enqueueSnackbar, err.response.data.message, 'error');
		})
	}

	function displayUsers() {
		function getButtons(elem: User) {
			if (elem.status === 'pending')
			{
				if (elem.isReceiver)
					return (
						<>
							<div className="accept" onClick={() => acceptFriend(elem)}>
								<img src={require("../../images/checkmark.png")} />
							</div>
							<div className="denied" onClick={() => denyFriend(elem)}>
								<img src={require("../../images/cross.png")} />
							</div>
						</>
					);
				return (
					<>
					<div className="pending">
						<img className="option" src={require('../../images/hourglass.png')} />
					</div>
					<div className="remove" onClick={() => denyFriend(elem)}>
						<img  src={require('../../images/trashcan.png')} />
					</div>
					</>
				);
			}
			return (
				<>
				<div className="active" onClick={() => {goToProfile(elem)}}>
					<p>View profile</p>
				</div>
				<div className="remove" onClick={() => denyFriend(elem)}>
					<img  src={require('../../images/trashcan.png')} />
				</div>
				</>
			);
		}

		return users.map(elem => {
			return (
				<div className="friendblock" key={elem.id}>
					<h1>{elem.username}</h1>
					<img className="avatar" src={avatars.find(o => o.id === elem.id)?.avatar} />
					<div className="status">
						{getButtons(elem)}
					</div>
				</div>
			);
		})
	}

	return (
		<div className="friends">
			<button onClick={goHome}>Home</button>
			<h1>Friends</h1>
			{displayUsers()}
		</div>
	);
}

export default Friends;