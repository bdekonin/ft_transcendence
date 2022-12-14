import { useEffect, useState , useContext } from 'react';
import { SocketContext } from '../../context/socket';
import Chat from './Chat';

type User = {
	id: number;
	username: string;
};

const Channels: React.FC<{
	user: User | null;
	currentChat: Chat | null;
	setCurrentChat: (chat: Chat | null) => void;
}> = ({ user, currentChat, setCurrentChat }) => {

	const socket = useContext(SocketContext);

	useEffect(() => {
		/* Listen to new and deleted created chats */
	}, [socket]);

	return (
		<div>
			<h1>Channels</h1>
			{currentChat?.id}
			{currentChat?.name}
		</div>
	);
};

export default Channels;