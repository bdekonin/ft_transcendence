import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useCallback, useEffect, useState } from "react";
import './style.css'

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
	
	const navigate = useNavigate();
	const [user, setUser] = useState<User>();
	const [users, setUsers] = useState<User[]>([]);
	const [avatars, setAvatars] = useState<Avatar[]>([]);
	
	document.body.style.backgroundColor = "#474E68";
	function goHome(){ navigate("/"); }
	function goToProfile(otherUser: User) {	navigate('/profile?user=' + otherUser.username); }

	useEffect(() => {
		console.log('just loaded again');
			axios.get('http://localhost:3000/user', {withCredentials: true})
			.then(res => {
				setUser(res.data);
			})
	}, [])

	useEffect(() => {
		if (user === undefined)
			return ;
		axios.get('http://localhost:3000/social', {withCredentials: true})
		.then(res => {
			console.log(res.data);
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
				setUsers(oldArr => [...oldArr, newUser])
			})
		})
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
			}
		})
	}, [users])



	function acceptFriend(otherUser: User) {
		axios.put('http://localhost:3000/social/' + otherUser.id + '/follow', {}, {withCredentials: true})
		.then(() => {
			window.location.reload();
		})
	}

	function denyFriend(otherUser: User) {
		axios.delete('http://localhost:3000/social/' + otherUser.id + '/unfollow', {withCredentials: true})
		.then(() => {
			window.location.reload();
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