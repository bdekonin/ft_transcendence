

const rightMessage: React.FC<{
	key: number;
	sender: string;
	content: string;
	sendTime: string;
}> = ({ key, sender, content, sendTime }) => {

	
	return (
		<div className="box right" key={key}>
			<span className="username-right">You</span>
			<p>{content}</p>
			<span className="time-right">{sendTime}</span>
		</div>
	);
}
export default rightMessage;