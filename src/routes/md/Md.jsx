import React, { useCallback, useEffect, useRef, useState } from 'react';
import showdown from 'showdown';
import debounce from 'lodash.debounce';

import './style.scss';
import { getContentType } from "../../util/contentType";

const converter = new showdown.Converter();

const getHtml = (md, editable, id = null) => {
    return `<!DOCTYPE html><html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Note</title>
  <meta http-equiv="x-ua-compatible" content="ie=edge"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
  <link href="/_markdown.css" rel="stylesheet" type="text/css" />
  <link href="https://mirri.link/49Y-aoo" rel="stylesheet" type="text/css" />
</head>
<body>
<article class="markdown-body">
  ${converter.makeHtml(md)}
</article>
${editable ? `
<a href="https://mirri.link/md/${id}" aria-label="Edit" title="Edit" class="edit-button">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M6.293 17.707c.19.19.45.29.7.29 .25 0 .51-.1.7-.3l2.58-2.59c.48.11 1.218.24 2.1.24 1.66 0 4.11-.47 6.31-2.66 3.81-3.82 4.273-10.37 4.291-10.65 .01-.29-.09-.567-.3-.78 -.21-.21-.49-.31-.78-.3 -.28.01-6.83.47-10.642 4.29 -3.18 3.17-2.74 6.93-2.41 8.4l-2.6 2.59c-.391.39-.391 1.02 0 1.41Z"/><path d="M21 24c.55 0 1-.45 1-1v-8c0-.56-.45-1-1-1 -.56 0-1 .44-1 1v7H2V4h7c.55 0 1-.45 1-1 0-.56-.45-1-1-1H1C.44 2 0 2.44 0 3v20c0 .55.448 1 1 1h20Z"/></g></svg>
</a>
<style>
    .edit-button {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: #fff;
        border-radius: 2rem;
        padding: 0.75rem;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1);
        z-index: 100;
    }
    .edit-button:hover {
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1);
    }
    .edit-button svg {
        width: 1rem;
        height: 1rem;
        display: block;
    }
    .edit-button svg g {
        fill: #007aff;
    }
    .edit-button:hover svg g {
        fill: #0057b8;
    }
</style>
<script type="x-original-content">${JSON.stringify({ md, editable, id })}</script>
<script>if(location.search === '?e=1') { document.body.innerHTML = 'Updating...'; setTimeout(() => location.href = '/${id}', 1000); }</script>
` : ''}
<script src="https://mirri.link/zVMRxri"></script>
<!--



${md.replace(/<!--/g, '< ! - -')}



-->
</body>
</html>`;
};

const MdPage = ({ id }) => {
    const [content, setActualContent] = useState('');
    const [editable, setEditable] = useState(true);
    const [loading, setLoading] = useState(false);
    const iframe = useRef();

    const setContent = (value) => {
        setActualContent(value);
        if (!id) {
            window.localStorage.mdContent = value;
        }
    };

    useEffect(() => {
        if (id) {
            (async () => {
                setLoading(true);
                const res = await fetch(`https://mirri.link/${id}`);
                const body = await res.text();
                const content = JSON.parse(body.match(/<script type="x-original-content">(.*)<\/script>/)[1]);
                setActualContent(content.md);
                setLoading(false);
            })();
        } else if (window && window.localStorage.mdContent) {
            setActualContent(window.localStorage.mdContent);
        }
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const updatePreview = useCallback(
        debounce((content) => {
            if (!iframe.current) {
                return;
            }
            iframe.current.contentWindow.document.body.innerHTML = getHtml(content, false);
        }, 300),
        []
    );

    useEffect(() => {
        updatePreview(content);
    }, [content, updatePreview]);

    const submit = async () => {
        setLoading(true);

        try {
            const res = await fetch(`https://mirri.link/api/get-url?${new URLSearchParams({
                filename: 'index.html',
                contentType: 'text/html',
                editable: editable ? 'true' : 'false',
                id: id || undefined
            })}`);
            const { url, publicUrl, key } = await res.json();
            if (!publicUrl) {
                throw new Error('No public URL found');
            }

            await fetch(url, {
                method: 'PUT',
                body: getHtml(content, editable, key),
                headers: {
                    'Content-Type': 'text/html',
                    'Content-Disposition': `inline; filename="index.html"`
                },
            });


            if (id) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setLoading(false);
            setContent('');

            location.href = publicUrl + (id ? '?e=1' : '');
        } catch (e) {
            alert(e.message || 'Something went wrong :(');
            setLoading(false);
        }
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
                <button onClick={submit}>{loading ? 'Loading...' : (id ? 'Update page' : 'Publish page')}</button>
                {!id && <label htmlFor='editable'>
                    <input
                        type="checkbox"
                        id="editable"
                        checked={editable}
                        onChange={(e) => setEditable(e.target.checked)}/>
                    Editable
                </label>}
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
