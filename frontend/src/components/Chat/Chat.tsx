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
	const [chats, setChats] = useState<Chat[]>([]);
	const [currentChat, setCurrentChat] = useState<Chat>({id: 0, name: ''});
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatBoxMsg, setChatBoxMsg] = useState<string>('');

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
		axios.get('http://localhost:3000/chat/' + user?.id + '/chats', { withCredentials: true })
		.then(res => {
			setChats(res.data);
		})
		.catch(err => {
			navigate('/login');
		});
	}, [user]);

	/* Setting the current chat after retrieving chats */
	useEffect(() => {
		if (chats.length != 0) {
			setCurrentChat(chats[0]);
		}
	}, [chats]);

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

	}, [currentChat]);


	function renderUsers() {

	}

	function renderRooms() {
		return (
			<div className="rooms">
				<h2>Rooms</h2>
				<ul>
					{
						chats.map(chat => {
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
					<li><p className='room-name-clickable'>One</p></li>
					<li><p className='room-name-clickable'>Two</p></li>
					<li><p className='room-name-clickable'>Three</p></li>
					<li><p className='room-name-clickable'>Four</p></li>
				</ul>

				<h3>Private Rooms</h3>
				<ul>
					<li><p className='room-name-clickable'>One</p></li>
					<li><p className='room-name-clickable'>Two</p></li>
					<li><p className='room-name-clickable'>Three</p></li>
					<li><p className='room-name-clickable'>Four</p></li>
				</ul>
			</div>
		)
	}
	function renderMesseges() {
		return (
			<div className="messages">
				<h2>Chat Messages</h2>
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

	function postMessage() {
		const payload = {
			"chatID": currentChat.id,
			"message": chatBoxMsg
		}

		axios.post('http://localhost:3000/chat/' + user?.id + '/message', payload, { withCredentials: true })
		.then(res => {
			setCurrentChat(currentChat);
		})
		.catch(err => {
			navigate('/login');
		});
		// Call socket!!
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
					onClick={() => postMessage()}>
						Send
				</button>
			</div>
		)
	}

	return (
		<div className="main-container">
			{renderRooms()}
			{renderMesseges()}
			{renderChatBox()}
		</div>
	);
}
export default Chat;





