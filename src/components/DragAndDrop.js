import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownCircle, Circle } from 'react-feather';

const selectFiles = () => new Promise(resolve => {
	let input = document.createElement('input');
	input.type = 'file';

	input.onchange = () => {
		let files = Array.from(input.files);
		resolve(files);
	};

	input.click();
});

const DragAndDrop = ({ children, className, handleDrop, handleRedirect }) => {
	const [dragging, setDragging] = useState(false);
	const dropRef = useRef();

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragIn = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setDragging(true);
		} else if (e.dataTransfer.types && e.dataTransfer.types.length > 0) {
			setDragging(true);
		}
	};

	const handleDragOut = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragging(false);
	};

	const defaultContent = (
		<div className="click-target" onClick={async() => {
			const files = await selectFiles();
			if (files && files.length) {
				handleDrop(files);
			}
		}}>
			<Circle size={32}/>
			<span>Drop your stuff</span>
		</div>
	);

	const hoverContent = (
		<>
			<ArrowDownCircle size={32}/>
			<span>Drop it like it's hot</span>
		</>
	);

	useEffect(() => {
		const handleDragDrop = (e) => {
			e.preventDefault();
			e.stopPropagation();
			setDragging(false);
			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				handleDrop(e.dataTransfer.files);
				e.dataTransfer.clearData();
			} else if (
				e.dataTransfer.items[0] &&
				e.dataTransfer.items[0].kind === 'string'
			) {
				e.dataTransfer.items[0].getAsString((string) => {
					if (string.startsWith('http://') || string.startsWith('https://')) {
						handleRedirect(string);
					} else {
						handleDrop([
							{
								name: 'r.txt',
								type: 'text/plain',
								body: string,
							},
						]);
					}
					e.dataTransfer.clearData();
				});
			}
		};

		if (dropRef.current) {
			const div = dropRef.current;
			div.addEventListener('dragenter', handleDragIn);
			div.addEventListener('dragleave', handleDragOut);
			div.addEventListener('dragover', handleDrag);
			div.addEventListener('drop', handleDragDrop);
			return () => {
				div.removeEventListener('dragenter', handleDragIn);
				div.removeEventListener('dragleave', handleDragOut);
				div.removeEventListener('dragover', handleDrag);
				div.removeEventListener('drop', handleDragDrop);
			};
		}
	}, [dropRef, handleDrop, handleRedirect]);

	return (
		<div
			className={`${dragging ? className.replace('success', '') : dragging || className} ${
				dragging ? 'active' : ''
			}`}
			ref={dropRef}
		>
			{dragging ? hoverContent : children || defaultContent}
		</div>
	);
};

export default DragAndDrop;
