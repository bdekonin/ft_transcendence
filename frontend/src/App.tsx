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
import React, { useContext, useEffect } from "react";
import { SocketContext } from "./context/socket";
import Game from "./components/Game/Game";
import Protected from "./Auth";

const App:React.FC = () =>
{
	const minute = 60 * 1000; /* 1 Minute * 1 second */
	const socket = useContext(SocketContext);
	document.body.style.background = "#474E68";

	useEffect(() => {
		// interval
		const interval = setInterval(() => {
			socket.emit('ping');
		}, minute * 1);

		// interval.
	});

	return (
		<SocketContext.Provider value={socket}>
		<Router>
			<Routes>
				<Route path='/' element={<Protected><Home/></Protected>}/>
				<Route path='/chat' element={<Protected><Chat/></Protected>}/>
				<Route path='/login' element={<Login />}/>
				<Route path='/profile' element={<Protected><Profile /></Protected>}/>
				<Route path='/friends' element={<Protected><Friends /></Protected>}/>
				<Route path='/social' element={<Protected><Social /></Protected>}/>
				<Route path='/settings' element={<Protected><Settings /></Protected>}/>
				<Route path='/game' element={<Protected><Game /></Protected>}/>
				<Route path='/aboutus' element={<Login />}/>
			</Routes>
		</Router>
		</SocketContext.Provider>
	);
}

export default App;
