import { middleware } from '@includable/serverless-middleware';
import { nanoid } from 'nanoid';
import showdown from 'showdown';
import AWS from 'aws-sdk';

const dependencies = () => ({
	s3: new AWS.S3({ useAccelerateEndpoint: true })
});

export const app = async({ body: { content } }, { s3 }) => {
	if (!content) {
		throw new Error('Missing required parameters.');
	}

	const key = nanoid(7);
	const converter = new showdown.Converter({
		tables: true,
		strikethrough: true,
		tasklists: true,
		ghCodeBlocks: true
	});

	const html = `<!DOCTYPE html><html lang="en">
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
  ${converter.makeHtml(content)}
</article>
<script src="https://mirri.link/zVMRxri"></script>
<!--



${content.replace(/<!--/g, '< ! - -')}



-->
</body>
</html>`;

	await s3.putObject({
		Bucket: 'schof-link-files',
		Key: key,
		ContentType: 'text/html',
		ContentDisposition: `inline; filename="index.html"`,
		ACL: 'public-read',
		Body: html
	}).promise();

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			key,
			url: `https://mirri.link/${key}`,
			publicUrl: `https://mirri.link/${key}`,
		}),
	};
};

export const handler = middleware(app).register(dependencies);
