export const getImageUrl = (rawUrl?: string | null, apiBase?: string) => {
    if (!rawUrl) return '';

    const trimmed = rawUrl.trim();
    if (!trimmed) return '';

    // Absolute URL (Cloudinary or any CDN)
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // Protocol-relative URL
    if (/^\/\//.test(trimmed)) return `https:${trimmed}`;

    // Legacy local uploads path, prefix API base
    if (trimmed.startsWith('/')) {
        const base = (apiBase || '').replace(/\/$/, '');
        return `${base}${trimmed}`;
    }

    // Some malformed values may come as `res.cloudinary.com/...` without protocol
    if (trimmed.startsWith('res.cloudinary.com/')) {
        return `https://${trimmed}`;
    }

    return trimmed;
};
