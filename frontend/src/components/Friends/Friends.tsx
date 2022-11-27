import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect } from "react";

interface User {
	id: number;
	username: string;
}

const Friends:React.FC = () => {

	const navigate = useNavigate();

	function goHome(){ navigate("/"); }

	document.body.style.backgroundColor = "#474E68";

	useEffect(() => {
	  showAll();
	}, [])
	
	useEffect(() => {
		axios.get('http://localhost:3000/user', {withCredentials: true})
		.then(res => {
			console.log('user info:');
			console.log(res);
		})
	}, [])

	function showAll() {
		axios.get("http://localhost:3000/social/2", {withCredentials: true})
		.then((res) => {
			console.log('Info here:');
			console.log(res.data);
		})
	}

	return (
		<>
			<div>
				<h1>Friends</h1>
				<button onClick={goHome}>Home</button>
			</div>
		</>
	);
}

export default Friends;