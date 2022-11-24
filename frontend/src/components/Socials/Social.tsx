import axios from "axios";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
	id: number;
	username: string;
	avatar: File;
	avatar_src: string;
	wins: number;
	loses: number;
}

const Social: FC = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState<User[]>([]);

	document.body.style.backgroundColor = "#1a1a1a";

	useEffect(() => {
		axios.get("http://localhost:3000/user/all", {withCredentials: true})
		.then((response) => {
			setUsers(response.data);
			// setAvatar(response.data.avatar);
			// console.log(users);
		})
		.catch((error) => {
			console.log(error);
			navigate("/login");
		})
	}, []);

	useEffect(() => {
		users.map(elem => {
			axios.get("http://localhost:3000/user/"+elem.id+"/avatar", {withCredentials: true, responseType: 'blob', headers: { 'Content-Type': 'multipart/form-data' }})
			.then((res) => {
				const imageObjectURL = URL.createObjectURL(res.data);
				// elem.avatar_src = imageObjectURL;
				
			})
		})
		console.log(users);
	}, [users]);

	function getUsers() {

		return users.map((user) => {
			
			
			return (
				<div key={user.id}>
					<img src={user.avatar_src} alt="Avatar" />
					<h1>{user.username}</h1>
					<h2>{user.wins} Wins</h2>
					<h2>{user.loses} Loses</h2>
				</div>
			);
		});
	}

	return (
		<>
			<h1>Socials</h1>
			{getUsers()}
			<h2>test</h2>
		</>
	);
}

export default Social;
