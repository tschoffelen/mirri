import React, { useState } from 'react';
import { ArrowUpCircle, Copy, XCircle } from 'react-feather';
import { toast, Toaster } from 'react-hot-toast';
import copy from 'copy-to-clipboard';

import DragAndDrop from './components/DragAndDrop';

const BoxPage = () => {
	const [text, setText] = useState(null);
	const [className, setClassName] = useState('');

	return (
		<div>
			<Toaster/>
			<DragAndDrop
				className={`box-area ${className}`}
				handleDrop={async(files) => {
					try {
						const file = files[0];

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
