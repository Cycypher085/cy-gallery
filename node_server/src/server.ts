import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Helper function to read HTML files from the parent directory
const readHtmlFile = (fileName: string) => {
    const filePath = path.join(__dirname, '../../', fileName);
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return '404 Not Found';
    }
};

// Route for the homepage (Gallery with map)
app.get('/', (req: Request, res: Response) => {
    res.send(readHtmlFile('gallery_home_with_interactive_map/code.html'));
});

// Route for the photo discovery page
app.get('/discovery', (req: Request, res: Response) => {
    res.send(readHtmlFile('photo_discovery_and_details/code.html'));
});

// Route for the photo upload page
app.get('/upload', (req: Request, res: Response) => {
    res.send(readHtmlFile('upload_your_photography/code.html'));
});

// --- API Endpoints ---

// Placeholder endpoint for Cloudflare R2 Presigned URLs
// In the future, the frontend will call this to get a secure upload URL
app.get('/api/upload-url', (req: Request, res: Response) => {
    // TODO: Integrate Cloudflare R2 SDK here
    // 1. Verify user authentication (optional but recommended)
    // 2. Generate a unique file name/key
    // 3. Request a presigned URL from R2 for PUT operation
    // 4. Return the URL to the frontend

    res.json({
        status: 'success',
        message: 'This is a placeholder for generating R2 presigned URLs. R2 SDK integration is needed.',
        mockUrl: 'https://storage.example.com/mock-upload-url-for-frontend'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Navigate to the links to view the gallery.');
});
