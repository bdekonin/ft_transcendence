import { User } from "../Channel/Channels";
import Chat from "../Chat";

const Messages: React.FC<{
	currentUser: User | null;
	currentChat: Chat | null;
}> = ({ currentUser, currentChat }) => {
	return (
		<p>Loading...</p>
	)
}
export default Messages;