

const leftMessage: React.FC<{
	myKey: number;
	sender: string;
	content: string;
	sendTime: string;
}> = ({ myKey, sender, content, sendTime }) => {

	
	return (
		<div className="box" key={myKey}>
			<span className="username-left">{sender}</span>
			<p>{content}</p>
			<span className="time-left">{sendTime}</span>
		</div>
	);
}
export default leftMessage;