import axios from "axios";
import { useEffect, useState } from "react";

interface User {
	id:			number;
	email:		string;
	firstName?:	string;
	lastName?:	string;
	userName?:	string;
}

interface Auth {
	msg: string;
}

const App:React.FC = () =>
{
	const [display, setDisplay] = useState<User[]>([]);
	const [auth, setAuth] = useState<Auth>({msg: ""});

	async function setData() {
		axios('http://localhost:3000/user')
		.then((elem) => {
			setDisplay(elem.data);
		})
	}

	async function setAuthFunc() {
		// axios('http://localhost:3000/auth/status', {withCredentials: true})
		axios.get('http://localhost:3000/auth/status', {withCredentials: true})
		.then((elem) => {
			setAuth(elem.data);
			console.log(elem);
		})
	}

	async function logout() {

		axios.get('http://localhost:3000/auth/destroy', {withCredentials: true})
		.then((elem) => {
			console.log(elem);
			setAuthFunc();
		})

	}

	useEffect(() => {
		setData();
		setAuthFunc();
	}, [])

	return (
		<div> 
			<h1>These are all the Users!</h1>
			{display.map((element) => {return (<p>{element.email}</p>)})}
			<a href="http://localhost:3000/auth/google/login">
				<button >Google Login</button>
			</a>
			<a href="http://localhost:3000/auth/42/login">
				<button >42 Login</button> 
			</a>

			<button onClick={logout}>Logout</button>
			{<p>{auth.msg}</p>}
		</div>
	);
}

export default App;
