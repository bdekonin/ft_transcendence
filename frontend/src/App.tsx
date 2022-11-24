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



const App:React.FC = () =>
{
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Home/>}/>
				<Route path='/login' element={<Login />}/>
				<Route path='/profile' element={<Login />}/>
				<Route path='/friends' element={<Friends />}/>
				<Route path='/social' element={<Social />}/>
				<Route path='/Settings' element={<Login />}/>
				<Route path='/aboutus' element={<Login />}/>
			</Routes>
		</Router>
	);
}

export default App;
