import { AwsClient } from 'aws4fetch';

interface Env {
    MY_BUCKET: R2Bucket;
    CLOUDFLARE_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    UPLOAD_PASSCODE: string;
    R2_BUCKET_NAME: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // 1. Basic Passcode Validation
    let passcode = '';
    let filename = '';
    let contentType = '';

    try {
        const body: any = await request.json();
        passcode = body.passcode;
        filename = body.filename;
        contentType = body.contentType;
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
    }

    // Use a fallback passcode for local dev if env var is missing
    const expectedPasscode = env.UPLOAD_PASSCODE || 'cycypher2026';

    if (passcode !== expectedPasscode) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Passcode' }), { status: 401 });
    }

    if (!filename || !contentType) {
        return new Response(JSON.stringify({ error: 'Missing filename or contentType' }), { status: 400 });
    }

    // 2. Generate Presigned URL using aws4fetch
    const aws = new AwsClient({
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        region: 'auto',
        service: 's3'
    });

    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = env.R2_BUCKET_NAME || 'gallery';

    // Clean filename to prevent weird characters and generate unique path
    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const objectKey = `uploads/${Date.now()}-${safeFilename}`;

    const url = new URL(`https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${objectKey}`);

    // Create a signed request that expires in 15 minutes (900 seconds)
    // aws4fetch automatically hashes the payload if we provide empty bod, but for presigned we use query strings usually.
    // Actually, aws4fetch 'sign' method natively supports generating presigned URLs if we specify signQuery: true

    url.searchParams.set('X-Amz-Expires', '900');

    const signedRequest = await aws.sign(url, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType
        },
        aws: { signQuery: true }
    });

    return new Response(JSON.stringify({
        url: signedRequest.url,
        key: objectKey
    }), {
        status: 200,
        headers: {
            'content-type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
};
