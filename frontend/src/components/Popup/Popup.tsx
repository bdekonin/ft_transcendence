import React, { useContext, useEffect, useState } from 'react'
import { SocketContext } from '../../context/socket'
import './style.css'

export const Popup = () => {

	const socket = useContext(SocketContext);
	const [show, setShow] = useState(false);
	const [msg, setMsg] = useState<String>('');

	useEffect(() => {
		socket.on('chat/refresh-message', (e) => {
			setShow(true);
			console.log(e);
			setMsg('You received a new message from: ' + e.parent.name);
			setTimeout(() => setShow(false), 5000);
		})
		return () => {
			socket.off('chat/refresh-message')
		}
	}, [socket]);

	if (!show)
		return (<></>);

	return (
		<div className='popup'>
			{msg}
		</div>
	);
}
