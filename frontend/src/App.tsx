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
import React from "react";
import { socket, SocketContext } from "./context/socket";

const App:React.FC = () =>
{
	document.body.style.background = "#474E68";

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
				<Route path='/aboutus' element={<Login />}/>
			</Routes>
		</Router>
		</SocketContext.Provider>
	);
}

export default App;
