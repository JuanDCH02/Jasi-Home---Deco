const UPLOAD_SEGMENT = '/image/upload/';

/**
 * Pide a Cloudinary la imagen al ancho indicado y en el formato más liviano que
 * acepte el navegador (WebP/AVIF). Las URLs que no son de Cloudinary se devuelven igual.
 */
export const optimizeImageUrl = (url: string, width: number): string =>
    url.includes('res.cloudinary.com') && url.includes(UPLOAD_SEGMENT)
        ? url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}f_auto,q_auto,c_limit,w_${width}/`)
        : url;
