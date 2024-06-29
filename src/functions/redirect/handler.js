import { middleware } from '@includable/serverless-middleware';
import { nanoid } from 'nanoid';
import AWS from 'aws-sdk';

const dependencies = () => ({
	s3: new AWS.S3({ useAccelerateEndpoint: true })
});

export const app = async({ body: { url } }, { s3 }) => {
	if (!url) {
		throw new Error('Missing required parameters.');
	}

	const key = nanoid(7);

	await s3.putObject({
		Bucket: 'schof-link-files',
		Key: key,
		ContentType: 'text/html',
		ContentDisposition: `inline; filename="index.html"`,
		ACL: 'public-read',
		Body: `<html><meta http-equiv="refresh" content="0;URL='${url}'"/>Redirecting to ${url}...</html>`,
		WebsiteRedirectLocation: url
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
