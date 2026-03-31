/**
 * Helper utility to optimize Cloudinary URLs by inserting transformation parameters.
 * @param url The original Cloudinary URL
 * @param options Transformation options: width, height, quality
 * @returns Optimized URL string
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: { width?: number; height?: number; quality?: number | string; face?: boolean } = {}
): string {
  if (!url) return null as any;
  if (!url.includes("cloudinary.com")) return url;

  const { width, height, quality = "auto", face = false } = options;
  
  // Transformation string, e.g., "w_500,c_fill,q_auto,f_auto"
  const transformations = [
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    (width || height) ? "c_fill" : null,
    face ? "g_face" : null,
    `q_${quality}`,
    "f_auto", // Automatically serve WebP or better depending on browser support
  ]
    .filter(Boolean)
    .join(",");

  // Cloudinary URL format: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<version>/<public_id>
  // We need to insert our transformations after "/upload/"
  const uploadPart = "/upload/";
  const parts = url.split(uploadPart);
  
  if (parts.length !== 2) return url;

  return `${parts[0]}${uploadPart}${transformations}/${parts[1]}`;
}
