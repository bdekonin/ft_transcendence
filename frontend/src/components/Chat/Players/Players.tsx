import CircularProgress from '@mui/material/CircularProgress';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../context/socket';
import Chat from '../Chat';



type User = {
	id: number;
	username: string;
};

type ChannelPayload = {
	id: number;
	user: User;
}

const Players: React.FC<{
	user: User | null;
	currentChat: Chat | null;
}> = ({ currentChat }) => {

	const socket = useContext(SocketContext);

	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		if (socket) {
			socket.on('chat/refresh-users-join', (payload: ChannelPayload) => {
				console.log('chat/refresh-users-join', payload);
				if (payload.id === currentChat?.id) {
					setUsers((users) => [...users, payload.user]);
				}
			});

			socket.on('chat/refresh-users-leave', (payload: ChannelPayload) => {
				console.log('chat/refresh-users-leave', payload);
				if (payload.id === currentChat?.id) {
					setUsers((users) => users.filter((user) => user.id !== payload.user.id));
				}
			});
		}

		return () => {
			socket.off('chat/refresh-users-join');
			socket.off('chat/refresh-users-leave');
		}
	});

	useEffect(() => {
		if (currentChat) {
			setUsers(currentChat.users);
		}
	}, [currentChat]);

	return (
		<div>
			{
				users.map((user) => (
					<div key={user.id}>
						{user.username}
					</div>
				))
			}
		</div>
	);
}
export default Players;