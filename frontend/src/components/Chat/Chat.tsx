import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment, { Moment } from 'moment';
import './style.css'

interface User {
	id: number;
	username: string;
}

interface Chat {
	id: number;
	name: string;
}
interface Message {
	id: number;
	message: string;
	sender: User;
	createdAt: string;
}

const Chat: React.FC = () => {
	
	const navigate = useNavigate();
	const [user, setUser] = useState<User>();
	const [currentChat, setCurrentChat] = useState<Chat>({id: 0, name: ''});
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatBoxMsg, setChatBoxMsg] = useState<string>('');
	
	/* Chats */
	const [joinedChats, setJoinedChats] = useState<Chat[]>([]);
	const [publicChats, setPublicChats] = useState<Chat[]>([]);
	const [protectedChats, setProtectedChats] = useState<Chat[]>([]);

	/* Refresh */
	const [pong, setPong] = useState('');

	document.body.style.background = '#323232';

	useEffect(() => {
		axios.get('http://localhost:3000/user', { withCredentials: true })
		.then(res => {
			setUser(res.data);
		})
		.catch(err => {
			navigate('/login');
		});
	}, []);

	/* Retrieving User's Chats */
	useEffect(() => {
		if (!user)
			return;
		axios.get('http://localhost:3000/chat/' + user?.id + '/chats?filter=all', { withCredentials: true })
		.then(res => {
			setJoinedChats(res.data.joined);
			setPublicChats(res.data.public);
			setProtectedChats(res.data.protected);
		})
		.catch(err => {
			navigate('/login');
		});
	}, [user, pong]);

	/* Setting the current chat after retrieving chats */
	useEffect(() => {
		if (joinedChats.length != 0) {
			if (pong == '')
				setCurrentChat(joinedChats[0]);
		}
	}, [joinedChats, pong]);

	/* Retrieving messages of the currentChat */
	useEffect(() => {
		if (currentChat.id == 0)
			return;
		axios.get('http://localhost:3000/chat/' + user?.id + '/messages/' + currentChat.id, { withCredentials: true })
		.then(res => {
			setMessages(res.data);
		})
		.catch(err => {
			navigate('/login');
		});

	}, [currentChat, pong]);

	function joinPublic(chat: Chat) {
		const payload = {
			chatID: chat.id
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			setPong(new Date().toISOString());
		})
		.catch(err => {
			navigate('/login');
		});
	}
	function joinProtected(chat: Chat) {
		const payload = {
			chatID: chat.id,
			password: prompt('Please enter the password')
		}
		axios.patch('http://localhost:3000/chat/' + user?.id + '/join', payload, { withCredentials: true })
		.then(res => {
			setPong(new Date().toISOString());
			alert('Success');
		})
		.catch(err => {
			if (err.response.data.statusCode === 418)
				navigate('/login');
			alert(err.response.data.message)
		});
	}

	function renderUsers() {

	}
	function renderRooms() {
		return (
			<div className="rooms">
				<h2>Rooms</h2>
				<ul>
					{
						joinedChats.map(chat => {
							return (
								<li key={chat.id}>
									<p className="room-name-clickable" onClick={() => setCurrentChat(chat)}>{chat.name}</p>
								</li>
							);
						})
					}
				</ul>
				<h3>Public Rooms</h3>
				<ul>
					{
						publicChats.map(chat => {
							return (
								<li key={chat.id}>
									<p className="room-name-clickable" onClick={() => joinPublic(chat)}>{chat.name}</p>
								</li>
							);
						})
					}
				</ul>

				<h3>Private Rooms</h3>
				<ul>
					{
						protectedChats.map(chat => {
							return (
								<li key={chat.id}>
									<p className="room-name-clickable" onClick={() => joinProtected(chat)}>{chat.name}</p>
								</li>
							);
						})
					}
				</ul>
			</div>
		)
	}
	function renderMessages() {
		return (
			<div className="messages">
				<h2 className='chatName'>{currentChat.name}</h2>
				{
					messages.map((message, index)=> {
						return (
							<div className={!(index % 2) ? 'container' : 'container darker'} key={message.id}>
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
	function renderChatBox() {
		return (
			<div className="chat-box">
				<input
					type="text"
					placeholder="Type message.."
					onChange={event => setChatBoxMsg(event.currentTarget.value)}
					name={chatBoxMsg}
					maxLength={256}>
				</input>
				<button
					type="submit"
					onClick={(event) => postMessage(event)}>
						Send
				</button>
			</div>
		)
	}

	function postMessage(event:any) {
		console.log('client', event);
		const payload = {
			"chatID": currentChat.id,
			"message": chatBoxMsg
		}
	
		axios.post('http://localhost:3000/chat/' + user?.id + '/message', payload, { withCredentials: true })
		.then(res => {
			setPong(new Date().toISOString());
			setChatBoxMsg('');
		})
		.catch(err => {
			navigate('/login');
		});
	}
	
	return (
		<div className="main-container">
			{renderRooms()}
			{renderMessages()}
			{renderChatBox()}
		</div>
	);
}
export default Chat;





