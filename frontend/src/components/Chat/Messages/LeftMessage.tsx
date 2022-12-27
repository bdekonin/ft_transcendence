

const leftMessage: React.FC<{
	key: number;
	sender: string;
	content: string;
	sendTime: string;
}> = ({ key, sender, content, sendTime }) => {

	
	return (
		<div className="box" key={key}>
			<span className="username-left">{sender}</span>
			<p>{content}</p>
			<span className="time-left">{sendTime}</span>
		</div>
	);
}
export default leftMessage;