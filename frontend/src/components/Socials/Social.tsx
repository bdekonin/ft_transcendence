import axios from "axios";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
		.catch((error) => {
			console.log(error);
			navigate("/login");
		});




		axios.get("http://localhost:3000/user/all", {withCredentials: true})
		.then(res => {
			console.log(res.data);
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
						<h1 className="username">{user.username}</h1>
						<h2 className="stats">{user.wins} Wins</h2>
						<h2 className="stats">{user.loses} Loses</h2>

					</div>
					
					{/* <div className="stats"> */}
						{/* </div> */}
					{/* </div> */}
					{/* <button onClick={() => {
						axios.put("http://localhost:3000/social/"+user.id+"/follow", {}, {withCredentials: true})
						.then(res => {
							console.log(res.data);
						})
						.catch((error) => {
							console.log(error);
						});
					}}>Follow</button> */}
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
