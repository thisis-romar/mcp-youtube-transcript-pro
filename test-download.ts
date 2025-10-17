// Download and display the full transcript from YouTube API
import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;

function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

async function downloadTranscript(videoUrl: string) {
    console.log('=== Downloading YouTube Transcript ===');
    console.log('Video URL:', videoUrl);
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
        console.error('❌ Could not extract video ID');
        return;
    }
    
    console.log('Video ID:', videoId);
    console.log('---\n');
    
    if (!API_KEY) {
        console.error('❌ YOUTUBE_API_KEY not found');
        return;
    }
    
    try {
        // Get caption tracks
        console.log('📝 Fetching caption tracks...');
        const captionsResponse = await youtube.captions.list({
            auth: API_KEY,
            part: ['snippet'],
            videoId: videoId,
        });
        
        const captions = captionsResponse.data.items || [];
        
        if (captions.length === 0) {
            console.error('❌ No captions available');
            return;
        }
        
        console.log(`✅ Found ${captions.length} caption track(s)`);
        
        // Download the first caption track
        const captionId = captions[0].id!;
        const language = captions[0].snippet?.language;
        
        console.log(`📥 Downloading captions (ID: ${captionId}, Language: ${language})...`);
        console.log('---\n');
        
        const downloadResponse = await youtube.captions.download({
            auth: API_KEY,
            id: captionId,
            tfmt: 'srt', // SubRip format with timestamps
        });
        
        const transcript = downloadResponse.data as string;
        
        if (!transcript || transcript.length === 0) {
            console.error('❌ Downloaded transcript is empty');
            return;
        }
        
        console.log('✅ Transcript downloaded successfully!');
        console.log(`Size: ${transcript.length} characters`);
        console.log('---\n');
        
        // Parse SRT format
        const segments = parseSRT(transcript);
        console.log(`📊 Parsed ${segments.length} segments`);
        console.log('---\n');
        
        // Display first 5 segments
        console.log('First 5 segments:');
        segments.slice(0, 5).forEach((seg, i) => {
            console.log(`[${i + 1}] ${seg.start}s → ${seg.end}s`);
            console.log(`    "${seg.text}"`);
        });
        
        console.log('\n---\n');
        
        // Display last 3 segments
        console.log('Last 3 segments:');
        segments.slice(-3).forEach((seg, i) => {
            console.log(`[${segments.length - 2 + i}] ${seg.start}s → ${seg.end}s`);
            console.log(`    "${seg.text}"`);
        });
        
        console.log('\n---\n');
        console.log('Summary:');
        console.log(`- Total segments: ${segments.length}`);
        console.log(`- Duration: ${segments[segments.length - 1].end} seconds (${(segments[segments.length - 1].end / 60).toFixed(2)} minutes)`);
        console.log(`- Language: ${language}`);
        
    } catch (error) {
        const err = error as any;
        console.error('❌ Error:', err.message);
        if (err.code) console.error('Code:', err.code);
        if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    }
}

interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}

function parseSRT(srt: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const blocks = srt.trim().split('\n\n');
    
    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 3) continue;
        
        // Parse timestamp line (e.g., "00:00:00,000 --> 00:00:02,500")
        const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (!timeMatch) continue;
        
        const startSeconds = 
            parseInt(timeMatch[1]) * 3600 + 
            parseInt(timeMatch[2]) * 60 + 
            parseInt(timeMatch[3]) + 
            parseInt(timeMatch[4]) / 1000;
        
        const endSeconds = 
            parseInt(timeMatch[5]) * 3600 + 
            parseInt(timeMatch[6]) * 60 + 
            parseInt(timeMatch[7]) + 
            parseInt(timeMatch[8]) / 1000;
        
        // Join remaining lines as text
        const text = lines.slice(2).join(' ').trim();
        
        segments.push({
            start: startSeconds,
            end: endSeconds,
            text: text
        });
    }
    
    return segments;
}

// Test with target video
const targetVideo = 'https://www.youtube.com/watch?v=lxRAj1Gijic';
downloadTranscript(targetVideo);
