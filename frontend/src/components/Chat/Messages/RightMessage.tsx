

const rightMessage: React.FC<{
	myKey: number;
	sender: string;
	content: string;
	sendTime: string;
}> = ({ myKey, sender, content, sendTime }) => {

	function parseTime() {
		const time = new Date(Number(sendTime));
		const hours = time.getHours();
		const minutes = time.getMinutes();
		const seconds = time.getSeconds();
		if (seconds < 10)
			return `${hours}:${minutes}:0${seconds}`;
		return `${hours}:${minutes}:${seconds}`;
	}

	return (
		<div className="box right" key={myKey}>
			<span className="username-right">You</span>
			<p>{content}</p>
			<span className="time-right">{parseTime()}</span>
		</div>
	);
}
export default rightMessage;