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
import Chat from "./components/Chat/Chat";
import React, { useEffect } from "react";
import { socket, SocketContext } from "./context/socket";
import Game from "./components/Game/Game";

const App:React.FC = () =>
{
	const minute = 60 * 1000; /* 1 Minute * 1 second */
	document.body.style.background = "#474E68";

	useEffect(() => {
		// interval
		const interval = setInterval(() => {
			socket.emit('ping');
		}, minute * 5);

		// interval.
	});

	return (
		<SocketContext.Provider value={socket}>
		<Router>
			<Routes>
				<Route path='/' element={<Home/>}/>
				<Route path='/chat' element={<Chat/>}/>
				<Route path='/login' element={<Login />}/>
				<Route path='/profile' element={<Profile />}/>
				<Route path='/friends' element={<Friends />}/>
				<Route path='/social' element={<Social />}/>
				<Route path='/settings' element={<Settings />}/>
				<Route path='/game' element={<Game />}/>
				<Route path='/aboutus' element={<Login />}/>
			</Routes>
		</Router>
		</SocketContext.Provider>
	);
}

export default App;
