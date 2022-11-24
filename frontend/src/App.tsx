import {
	BrowserRouter as Router,
	Route,
	Routes,
  } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Profile from "./components/Profile/Profile";



const App:React.FC = () =>
{
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Home/>}/>
				<Route path='/login' element={<Login />}/>
				<Route path='/profile' element={<Profile />}/>
			</Routes>
		</Router>
	);
}

export default App;
