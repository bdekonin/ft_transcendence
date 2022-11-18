import axios from "axios";
import { useEffect, useState } from "react";

interface User {
	id:			number;
	email:		string;
	firstName?:	string;
	lastName?:	string;
	userName?:	string;
}

const App:React.FC = () =>
{
	const [display, setDisplay] = useState<User[]>([]);

	async function setData() {
		axios('http://localhost:3001/user')
		.then((elem) => {
			setDisplay(elem.data);
		})
	}
	// const res = getUsers();
	// var data: Array<User> = [];
	useEffect(() => {
		setData();
	}, [])

	return (
		<div> 
			<h1>These are all the Users!</h1>
			{display.map((element) => {return (<p>{element.email}</p>)})}
		</div>
	);
}

export default App;
