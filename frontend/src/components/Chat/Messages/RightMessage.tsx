

const rightMessage: React.FC<{
	myKey: number;
	sender: string;
	content: string;
	sendTime: string;
}> = ({ myKey, sender, content, sendTime }) => {

	
	return (
		<div className="box right" key={myKey}>
			<span className="username-right">You</span>
			<p>{content}</p>
			<span className="time-right">{sendTime}</span>
		</div>
	);
}
export default rightMessage;