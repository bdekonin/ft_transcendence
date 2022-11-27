import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";
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

	function goHome(){ navigate("/"); }

	document.body.style.backgroundColor = "#474E68";

	useEffect(() => {
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


	function displayUsers() {
		function getButtons(elem: User) {
			if (elem.status === 'pending')
			{
				if (elem.isReceiver)
					return (
						<>
							<div className="accept">
								<img src={require("../../images/checkmark.png")} />
							</div>
							<div className="denied">
								<img src={require("../../images/cross.png")} />
							</div>
						</>
					);
				return (
					<div className="pending">
						<img className="option" src={require('../../images/hourglass.png')} />
					</div>
				);
			}
			return (<>hello</>);
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