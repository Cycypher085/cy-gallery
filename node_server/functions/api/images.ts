/// <reference types="@cloudflare/workers-types" />

interface Env {
    MY_BUCKET: R2Bucket;
    R2_PUBLIC_DOMAIN: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env } = context;
    const domain = env.R2_PUBLIC_DOMAIN || 'photos.cycypher.org';

    try {
        const list = await env.MY_BUCKET.list();
        // Exclude any folders or unexpected items if necessary, but list() returns objects
        const images = list.objects.map(obj => ({
            key: obj.key,
            url: `https://${domain}/${obj.key}`,
            size: obj.size,
            uploaded: obj.uploaded
        }));

        return new Response(JSON.stringify(images), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to list images' }), {
            status: 500,
            headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
