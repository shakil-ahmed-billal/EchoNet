import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes a string or an object's string properties recursively.
 */
export const sanitize = (data: any): any => {
    if (typeof data === 'string') {
        return sanitizeHtml(data, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt']
            }
        });
    }
    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                data[key] = sanitize(data[key]);
            }
        }
    }
    return data;
};
