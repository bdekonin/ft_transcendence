import React, { useContext } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes
} from "react-router-dom";
import Protected from "./Auth";
import Chat from "./components/Chat/Chat";
import Friends from "./components/Friends/Friends";
import Gamescreen from "./components/Gamescreen/Gamescreen";
import Game from "./components/Gamescreen/Pong/Game";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login/Login";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Social from "./components/Socials/Social";
import { SocketContext } from "./context/socket";

export function showSnackbarNotification(enqueueSnackbar: any, message: string, variant: string) {
	enqueueSnackbar(message, {
		variant: variant,
		autoHideDuration: 3000,
		anchorOrigin: { vertical: "top", horizontal: "right" }
	})
}

const App:React.FC = () =>
{
	const socket = useContext(SocketContext);
	document.body.style.background = "#474E68";


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
				<Route path='/pong' element={<Protected><Game /></Protected>}/>
				<Route path='/gamescreen' element={<Protected><Gamescreen /></Protected>}/>
			</Routes>
		</Router>
		</SocketContext.Provider>
	);
}

export default App;
