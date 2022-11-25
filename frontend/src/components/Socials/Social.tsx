import axios from "axios";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/socials.css";

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
	const [users, setUsers] = useState<User[]>([]);
	const [avatars, setAvatars] = useState<Avatars[]>([]);

	document.body.style.backgroundColor = "#474E68"; //very nice color

	//Getting the users details
	useEffect(() => {
		axios.get("http://localhost:3000/user/all", {withCredentials: true})
		.then(res => {
			setUsers(res.data);
		})
		.catch((error) => {
			console.log(error);
			navigate("/login");
		});
	}, []);

	//Getting the avatars
	useEffect(() => {
		users.map(elem => {
			axios.get("http://localhost:3000/user/"+elem.id+"/avatar", {withCredentials: true, responseType: 'blob'})
			.then((res) => {
				const imageObjectURL = URL.createObjectURL(res.data);
				setAvatars(prev => [...prev, {id: elem.id, avatar: imageObjectURL}]);
			})
		})
	}, [users]);

	function getUsers() {
		return users.map((user) => {
			return (
				<div key={user.id} className='userblock'>
					<div className="data">
						<h1>{user.username}</h1>
						<img src={avatars.find(elem => elem.id == user.id)?.avatar} alt="avatar" />
					</div>
					<div className="data">
						<h2>{user.wins} Wins</h2>
						<h2>{user.loses} Loses</h2>
					</div>
					<button onClick={() => {
						axios.put("http://localhost:3000/social/"+user.id+"/follow", {}, {withCredentials: true})
						.then(res => {
							console.log(res.data);
						})
						.catch((error) => {
							console.log(error);
						});
					}}>Follow</button>
				</div>
			);
		});
	}

	return (
		<div className="socials">
			<h1 className="header">Socials</h1>
			{getUsers()}
		</div>
	);
}

export default Social;
