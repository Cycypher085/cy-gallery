import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dotenv from 'dotenv';

dotenv.config();

// Define Configuration
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cy-gallery-bucket';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || 'photos.cycypher.org'; // Replace with your connected domain

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    console.error("❌ Missing required Cloudflare R2 credentials in .env file.");
    console.error("Make sure CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are set.");
    process.exit(1);
}

// Initialize S3 Client pointing to Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

async function uploadFile(filePath: string) {
    try {
        const fullPath = path.resolve(filePath);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`);
            process.exit(1);
        }

        const fileStream = fs.createReadStream(fullPath);
        const fileName = path.basename(fullPath);

        // Guess the content type (e.g., image/jpeg, image/png)
        const contentType = mime.lookup(fullPath) || 'application/octet-stream';

        console.log(`📤 Uploading ${fileName} to R2 bucket: ${BUCKET_NAME}...`);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName, // The name of the file in R2
            Body: fileStream,
            ContentType: contentType,
        });

        await s3Client.send(command);

        console.log('\n✅ Upload Successful!');
        console.log(`🌍 Public URL: https://${PUBLIC_DOMAIN}/${fileName}`);
        console.log(`(Make sure your bucket has public access connected to this domain)`);

    } catch (error) {
        console.error('❌ Upload failed:', error);
    }
}

// Run the script with the file path passed as an argument
const myFile = process.argv[2];
if (!myFile) {
    console.log('Usage: npx ts-node upload.ts <path/to/your/image.jpg>');
    process.exit(1);
}

uploadFile(myFile);
