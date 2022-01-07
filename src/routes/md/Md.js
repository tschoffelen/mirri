import React, { useCallback, useEffect, useRef, useState } from 'react';
import showdown from 'showdown';
import debounce from 'lodash.debounce';

import './style.scss';

const converter = new showdown.Converter();

const getHtml = (md) => {
	return `<!DOCTYPE html><html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Note</title>
  <meta http-equiv="x-ua-compatible" content="ie=edge"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
  <link href="/_markdown.css" rel="stylesheet" type="text/css" />
  <link href="https://schof.co/f/gttr/prism-(1).css" rel="stylesheet" type="text/css" />
</head>
<body>
<article class="markdown-body">
  ${converter.makeHtml(md)}
</article>
<script src="https://schof.co/f/9x70/prism-(1).js"></script>
</body>
</html>`;
};

const MdPage = () => {
	const [content, setActualContent] = useState('');
	const iframe = useRef();

	const setContent = (value) => {
		setActualContent(value);
		window.localStorage.mdContent = value;
	};

	useEffect(() => {
		if (window && window.localStorage.mdContent) {
			setActualContent(window.localStorage.mdContent);
		}
	}, []);

	const updatePreview = useCallback(
		debounce((content) => {
			if (!iframe.current) {
				return;
			}
			iframe.current.contentWindow.document.body.innerHTML = getHtml(content);
		}, 300),
		[]
	);

	useEffect(() => {
		updatePreview(content);
	}, [content, updatePreview]);

	const submit = async() => {
		const res = await fetch('https://schof.link/api/md', {
			method: 'POST',
			body: JSON.stringify({ content }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const { publicUrl } = await res.json();

		window.open(publicUrl);

		setContent('');
	};

	return (
		<div className="markdown-editor">
			<div className="markdown__editor">
        <textarea
	        autoFocus
	        value={content}
	        onChange={(e) => setContent(e.target.value)}
	        placeholder="Write something..."
        />
				<button onClick={submit}>Publish page</button>
			</div>

			<div className="markdown__preview">
				<iframe
					title="Markdown preview"
					key="preview"
					frameBorder="0"
					ref={iframe}
				/>
			</div>
		</div>
	);
};

export default MdPage;
