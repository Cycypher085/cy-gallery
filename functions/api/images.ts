interface Env {
    CY_GALLERY_BUCKET: R2Bucket;
    PUBLIC_DOMAIN: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const bucket = context.env.CY_GALLERY_BUCKET;

    if (!bucket) {
        return new Response(JSON.stringify({ error: "R2 bucket 'CY_GALLERY_BUCKET' is not bound. Please configure it in your Cloudflare Pages dashboard under Settings -> Functions -> R2 bucket bindings." }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        const listed = await bucket.list();
        const domain = context.env.PUBLIC_DOMAIN || 'photos.cycypher.org';

        // Map the objects to public CDN URLs
        const images = listed.objects.map(obj => {
            // Encode URI component to handle spaces and special characters in file names
            return `https://${domain}/${encodeURIComponent(obj.key)}`;
        });

        return new Response(JSON.stringify(images), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to list objects from R2", details: (error as Error).message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
