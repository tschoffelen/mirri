import mime from 'mime';

export const getContentType = (type, name) => {
	if (type) {
		return type;
	}

	return mime.getType(name) || 'application/octet-stream';
};
