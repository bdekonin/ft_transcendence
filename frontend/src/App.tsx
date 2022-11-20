import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import Home from "./Home/Home";
import Login from "./Login/Login";

const App:React.FC = () =>
{
	// const [display, setDisplay] = useState<User[]>([]);
	// const [auth, setAuth] = useState<Auth>({msg: ""});
	const [isLoggedIn, setLoggedIn] = useState(false);
	useEffect(() => {
		isAuthenticated();
	}, []);

	function isAuthenticated()
	{
		let isAuth: string;
		axios.get("http://localhost:3000/auth/status", {withCredentials: true})
		.then((elem) => {
			isAuth = elem.data.msg;
			console.log(elem.data);
			console.log(isAuth);
			if (isAuth === "Authenticated")
			{
				setLoggedIn(true);
				return ;
			}
			setLoggedIn(false);
		})
	}

	return (
		<>
			{isLoggedIn ? <Home/> : <Login/>}
		</>
	);
}

export default App;
