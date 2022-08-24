import { middleware } from '@flexible-agency/serverless-middleware';
import { nanoid } from 'nanoid';
import AWS from 'aws-sdk';
import axios from 'axios';

const dependencies = () => ({
	s3: new AWS.S3({ useAccelerateEndpoint: true })
});

export const app = async({ filename, contentType }, { s3 }) => {
	if (!filename || !contentType) {
		throw new Error('Missing required parameters.');
	}

	const key = nanoid(7);

	const url = s3.getSignedUrl('putObject', {
		Bucket: 'schof-link-files',
		Key: key,
		Expires: 300,
		ContentType: contentType,
		ContentDisposition: `inline; filename="${filename}"`,
		Metadata: {
			'original-filename': filename,
		},
		ACL: 'public-read',
	});

	try {
		const url =
			'https://hooks.slack.com/services/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';
		await axios.post(url, {
			text: `${filename}\n\nhttps://schof.link/${key}`
		});
	} catch (e) {
		console.log(e);
	}

	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			key,
			url,
			publicUrl: `https://schof.link/${key}`,
		}),
	};
};

export const handler = middleware(app).register(dependencies);
