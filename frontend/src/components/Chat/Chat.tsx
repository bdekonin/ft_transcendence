import { useEffect, useState , useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment';
import './style.css'
import { SocketContext } from '../../context/socket';

import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import MessageIcon from '@mui/icons-material/Message';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Channels from './Channel/Channels';
import Players from './Players/Players';

interface User {
	id: number;
	username: string;
}

interface Chat {
	id: number;
	type: string;
	name: string;
	users: User[];

	adminIDs: number[];
	bannedIDs: number[];
	mutedIDs: number[];
}
interface Message {
	id: number;
	message: string;
	sender: User;
	parent: Chat;
	createdAt: string;
}
interface Avatar {
	id: number,
	avatar: string
}

const Chat: React.FC = () => {
	
	const socket = useContext(SocketContext);
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [currentChat, setCurrentChat] = useState<Chat | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);

	document.body.style.background = '#323232';

	useEffect(() => {
		axios.get('http://localhost:3000/user', { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			console.log('err', err);
			if (err.response.data.statusCode === 401)
				navigate('/login');
			alert(err.response.data.message)
		});
	}, []); /* Renders only once */

	/* Means there is a new message so update messages when the chatID == currentChatID*/
	useEffect(() => {
		socket.on('chat/refresh-message', (payload: Message) => {
			if (payload.parent.id === currentChat?.id){
				setMessages((messages) => [payload, ...messages]);
			}
			else {
				/* Enable notification for that channel */
			}
		})
		return () => {
			socket.off('chat/refresh-message');
		}
	}, [socket]);

	function renderMessages(divName: string) {
		if (currentChat == null)
		return (
			<div className={divName}>
					<h1>Choose a chat</h1>
				</div>
			)
		return (
			<div className={divName}>
				<h2 className='chatName'>{currentChat.name}</h2>
				{
					messages.map((message, index)=> {
						return (
							<div className={!(index % 2) ? 'container' : 'container darker'} key={index}>
								<p className={!(index % 2) ? 'right' : ''}>{!(index % 2) ? message.sender.username : ''}</p>
								<p>{message.message}</p>
								<span className="time-right">{moment(Number(message.createdAt)).format('DD dddd HH:mm:ss')}</span>
								<p className={(index % 2) ? '' : 'right'}>{(index % 2) ? message.sender.username : ''}</p>
							</div>
						);
					})
				}
			</div>
		)
	}

	return (
		<div className="main-container">
			<Channels
				user={user}
				currentChat={currentChat}
				setCurrentChat={setCurrentChat}
				/>
			{renderMessages('block messages')}
			<Players
				currentUser={user}
				currentChat={currentChat}
			/>
		</div>
	);
}
export default Chat;





