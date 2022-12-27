import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../../context/socket";
import { User } from "../Channel/Channels";
import Chat from "../Chat";
import LeftMessage from "./LeftMessage";
import RightMessage from "./RightMessage";
import rightMessage from "./RightMessage";


interface Message {
	id: number;
	message: string;
	sender: User;
	parent: Chat;
	createdAt: string;
}

const Messages: React.FC<{
	currentUser: User | null;
	currentChat: Chat | null;
}> = ({ currentUser, currentChat }) => {

	const socket = useContext(SocketContext);

	const [messages, setMessages] = useState<Message[]>([]);

	const [mutes, setMutes] = useState<number[]>([]);



	useEffect(() => {
		if (!currentChat)
			return;
		if (!currentUser)
			return;

		axios.get('http://localhost:3000/chat/' + currentUser.id + '/messages/' + currentChat.id, { withCredentials: true })
		.then(res => {
			console.log('Incoming messages: ', res.data, ' for chat: ', currentChat.id, ' and user: ', currentUser.id, '');
			setMessages(res.data);
		})
		.catch(err => {
			console.log('err', err);
			alert(err.response.data.message)
		});

		setMutes(currentChat.muted);
	}, [currentChat]);


	useEffect(() => {
		if (!currentChat)
			return;
		socket.on('chat/refresh-message', (payload: Message) => {
			if (payload.parent.id === currentChat?.id){
				setMessages((messages) => [...messages, payload]);
				console.log('New message!', payload);
			}
			else {
				/* Enable notification for that channel */
			}
		})

		socket.on('chat/refresh-mutes', () => {
			axios.get('http://localhost:3000/chat/' + currentUser?.id + '/mutes/' + currentChat.id, { withCredentials: true })
			.then(res => {
				console.log('Incoming mutes: ', res.data, ' for chat: ', currentChat.id, '');
				setMutes(res.data);
			})
			.catch(err => {
				console.log('err', err);
				alert(err.response.data.message)
			});
		});


		return () => {
			socket.off('chat/refresh-message');
			socket.off('chat/refresh-mutes');
		}
	}, [currentChat]);

	function renderMessage(message: Message) {

		if (!currentUser)
			return null;

		const sender = message.sender.id == currentUser.id;
		
		if (mutes && mutes.includes(message.sender.id)) {
			return null;
		}

		if (sender) {
			return (
				<RightMessage
					key={message.id}
					sender={message.sender.username}
					content={message.message}
					sendTime={message.createdAt}
				/>
			)
		}
		else {
			return (
				<LeftMessage
					key={message.id}
					sender={message.sender.username}
					content={message.message}
					sendTime={message.createdAt}
				/>
			)
		}
	}


	if (!currentChat)
		return (
			<div className="block messages">
				<h1 className='title'>Choose a chat</h1>
			</div>
		)

	return (
		<div className="block messages">
			<h1 className='title'>{currentChat.name}</h1>
			{messages.map((message) => (
					renderMessage(message)
				)
			)}
		</div>
	)

	return null;
}
export default Messages;