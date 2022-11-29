import {
	BrowserRouter as Router,
	Route,
	Routes,
  } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Friends from "./components/Friends/Friends";
import Social from "./components/Socials/Social";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import React from "react";

interface socketInterface {
	socket: any;
}


export const socketContext = React.createContext<socketInterface | null>(null);

const App:React.FC = () =>
{
	document.body.style.background = "#474E68";

	return (
		<Router>
			<Routes>
				<Route path='/' element={<Home/>}/>
				<Route path='/login' element={<Login />}/>
				<Route path='/profile' element={<Profile />}/>
				<Route path='/friends' element={<Friends />}/>
				<Route path='/social' element={<Social />}/>
				<Route path='/settings' element={<Settings />}/>
				<Route path='/aboutus' element={<Login />}/>
			</Routes>
		</Router>
	);
}

export default App;
