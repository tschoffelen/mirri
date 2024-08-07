import React from "react";

const Docs = () => (
  <article className="markdown-body">
    <h1 style={{ borderBottom: 0, marginBottom: 10 }}>🌿 API documentation</h1>
    <p>
      The <a href="https://mirri.link">mirri.link</a> tool exposes a few API
      endpoints that can be used in other applications. This API is subject to
      change without notice.
    </p>

    <h2>Create a redirect</h2>
    <p>
      Create short URLs for longer URLs. Will return an object with a{" "}
      <code>publicUrl</code> property that contains the shortened URL.
    </p>
    <pre>
      <code>{`POST https://mirri.link/api/redirect
{
   "url": "https://example.com/"
}`}</code>
    </pre>

    <h2>Upload markdown document</h2>
    <p>
      Converts a markdown body into a HTML document and gives it a short link.
      Will return an object with a <code>publicUrl</code> property that contains
      the final URL.
    </p>
    <pre>
      <code>{`POST https://mirri.link/api/md
{
   "content": "# Hello World\\n\\nThis is a test."
}`}</code>
    </pre>

    <h2>Get upload link</h2>
    <p>
      Get a pre-signed URL to upload a file to. Will return an object with a{" "}
      <code>url</code> property that contains the URL to use to <code>PUT</code>{" "}
      the file to. The <code>publicUrl</code> property contains the final public
      URL.
    </p>
    <pre>
      <code>{`GET https://mirri.link/api/get-url
	?filename=example.txt
	&contentType=text/plain`}</code>
    </pre>
  </article>
);

export default Docs;
