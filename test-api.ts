// Test YouTube Data API with the target video
import { google } from 'googleapis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;

// Extract video ID from URL
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

async function testVideoInfo(videoUrl: string) {
    console.log('=== Testing YouTube Data API ===');
    console.log('Video URL:', videoUrl);
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
        console.error('❌ Could not extract video ID from URL');
        return;
    }
    
    console.log('Video ID:', videoId);
    console.log('---\n');
    
    if (!API_KEY) {
        console.error('❌ YOUTUBE_API_KEY not found in .env file');
        return;
    }
    
    try {
        // Get video info
        console.log('📹 Fetching video metadata...');
        const videoResponse = await youtube.videos.list({
            auth: API_KEY,
            part: ['snippet', 'contentDetails', 'status'],
            id: [videoId],
        });
        
        const video = videoResponse.data.items?.[0];
        if (!video) {
            console.error('❌ Video not found or is private');
            return;
        }
        
        console.log('✅ Video found!');
        console.log('Title:', video.snippet?.title);
        console.log('Channel:', video.snippet?.channelTitle);
        console.log('Duration:', video.contentDetails?.duration);
        console.log('Privacy:', video.status?.privacyStatus);
        console.log('---\n');
        
        // Check for captions
        console.log('📝 Checking for captions...');
        const captionsResponse = await youtube.captions.list({
            auth: API_KEY,
            part: ['snippet'],
            videoId: videoId,
        });
        
        const captions = captionsResponse.data.items || [];
        
        if (captions.length === 0) {
            console.log('⚠️  No captions available for this video');
            console.log('This video does not have captions enabled.');
        } else {
            console.log(`✅ Found ${captions.length} caption track(s):`);
            console.log('---');
            
            captions.forEach((caption, index) => {
                const trackKind = caption.snippet?.trackKind;
                const language = caption.snippet?.language;
                const name = caption.snippet?.name;
                const isAuto = trackKind === 'ASR';
                
                console.log(`[${index + 1}] Language: ${language} (${name || 'Default'})`);
                console.log(`    Type: ${isAuto ? '🤖 Auto-generated' : '✍️  Manual/Human'}`);
                console.log(`    Track Kind: ${trackKind}`);
                console.log(`    Caption ID: ${caption.id}`);
            });
        }
        
    } catch (error) {
        const err = error as any;
        console.error('❌ API Error:', err.message);
        if (err.code) {
            console.error('Error Code:', err.code);
        }
        if (err.errors) {
            console.error('Details:', JSON.stringify(err.errors, null, 2));
        }
    }
}

// Test the target video
const targetVideo = 'https://www.youtube.com/watch?v=lxRAj1Gijic';
testVideoInfo(targetVideo);
