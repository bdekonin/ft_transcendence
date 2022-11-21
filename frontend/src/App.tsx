import {
	BrowserRouter as Router,
	Route,
	Routes,
  } from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";


const App:React.FC = () =>
{
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Home/>}/>
				<Route path='/login' element={<Login />}/>
			</Routes>
		</Router>
	);
}

export default App;
