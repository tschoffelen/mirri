import React, { useEffect, useState } from 'react';
import { ArrowUpCircle, Copy, XCircle } from 'react-feather';
import { toast, Toaster } from 'react-hot-toast';
import copy from 'copy-to-clipboard';

import DragAndDrop from '../../components/DragAndDrop';
import { useLocation } from '@reach/router';

const BoxPage = () => {
	const [text, setText] = useState();
	const [className, setClassName] = useState('');

	// Redirect www subdomain -> naked domain
	const location = useLocation();
	useEffect(() => {
		if (location.hostname.includes('/www.')) {
			window.location.href = window.location.href.replace('/www.', '/');
		}
		if (location.hostname !== 'localhost' && location.protocol === 'http:') {
			window.location.href = window.location.href.replace('http://', 'https://');
		}
	}, [location]);

	const success = (publicUrl) => {
		setClassName('success');
		setText(
			<>
				<div className="box-result">
					<span className="box-url">{publicUrl}</span>
					<Copy
						className="box-copy"
						size={18}
						onClick={() => {
							if (copy(publicUrl)) {
								toast('Copied', {
									icon: '👏',
									style: {
										paddingLeft: 18,
										borderRadius: '24px',
										background: '#333',
										fontSize: 14,
										color: '#fff',
									},
								});
							}
						}}
					/>
				</div>
			</>
		);
	};

	return (
		<div>
			<Toaster/>
			<DragAndDrop
				className={`box-area ${className}`}
				handleRedirect={async(url) => {
					setClassName('loading');
					setText(
						<>
							<ArrowUpCircle size={32}/>
							<span>Creating short link...</span>
						</>
					);

					const res = await fetch('/api/redirect', {
						method: 'POST',
						body: JSON.stringify({ url }),
						headers: { 'Content-Type': 'application/json', },
					});
					const { publicUrl } = await res.json();
					success(publicUrl);
				}}
				handleDrop={async(files) => {
					try {
						const file = files[0];

						setClassName('loading');
						setText(
							<>
								<ArrowUpCircle size={32}/>
								<span>Uploading {file.name}...</span>
							</>
						);

						const res = await fetch(`/api/get-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);
						const { url, publicUrl } = await res.json();

						if (file.body) {
							await fetch(url, {
								method: 'PUT',
								body: file.body,
								headers: {
									'Content-Type': file.type,
									'Content-Disposition': `inline; filename="${file.name}"`
								},
							});
						} else {
							await fetch(url, {
								method: 'PUT',
								body: file,
								headers: {
									'Content-Disposition': `inline; filename="${file.name}"`,
								},
							});
						}

						success(publicUrl);
					} catch (e) {
						if (e.message && e.message.includes('Is a directory')) {
							e.message = 'Dude, that\'s a folder!';
						}
						setClassName('failed');
						setText(
							<>
								<XCircle size={32}/>
								<span>{e.message || 'Unknown error'}</span>
							</>
						);
					}
				}}
			>
				{text}
			</DragAndDrop>
		</div>
	);
};

export default BoxPage;
