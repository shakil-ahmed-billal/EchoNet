export const extractCloudinaryPublicId = (url: string | null | undefined): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
        // Typical structure: https://res.cloudinary.com/<cloud_name>/<resource_type>/<type>/v<version>/<folder>/<filename>.<ext>
        const parts = url.split('/');
        
        // Find the index of the version part ('v' followed by numbers)
        const versionIndex = parts.findIndex(p => p.startsWith('v') && !isNaN(parseInt(p.substring(1))));
        
        if (versionIndex === -1) {
            // If there's no version (sometimes Cloudinary URLs skip it), just take the last two parts assuming folder/filename
            const folder = parts[parts.length - 2];
            const fileWithExt = parts[parts.length - 1];
            const filename = fileWithExt.split('.')[0];
            return `${folder}/${filename}`;
        }
        
        // Extract everything after the version string
        const pathAfterVersion = parts.slice(versionIndex + 1).join('/');
        
        // Remove the file extension
        const publicId = pathAfterVersion.split('.')[0];
        
        return publicId;
    } catch (e) {
        console.error("Error extracting public ID from Cloudinary URL:", url, e);
        return null;
    }
};
