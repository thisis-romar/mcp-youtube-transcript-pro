/**
 * Comprehensive test of all MCP tools
 * 
 * Tests all four implemented tools:
 * - list_tracks: Lists available caption tracks
 * - get_transcript: Gets plain text transcript
 * - get_timed_transcript: Gets timestamped segments
 * - get_video_info: Gets video metadata
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { list_tracks, get_transcript, get_timed_transcript, get_video_info } from './src/tools';

const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=lxRAj1Gijic';

async function runTests() {
    console.log('=== MCP YouTube Transcript Pro - Tool Tests ===\n');
    console.log(`Testing with video: ${TEST_VIDEO_URL}\n`);
    
    try {
        // Test 1: list_tracks
        console.log('Test 1: list_tracks()');
        console.log('-'.repeat(50));
        const tracks = await list_tracks({ url: TEST_VIDEO_URL });
        console.log(`Found ${tracks.length} caption track(s):`);
        tracks.forEach((track, i) => {
            console.log(`  ${i + 1}. Language: ${track.lang}, Source: ${track.source}`);
        });
        console.log('✅ list_tracks passed\n');
        
        // Test 2: get_video_info
        console.log('Test 2: get_video_info()');
        console.log('-'.repeat(50));
        const videoInfo = await get_video_info({ url: TEST_VIDEO_URL });
        console.log(`Title: ${videoInfo.title}`);
        console.log(`Channel ID: ${videoInfo.channelId}`);
        console.log(`Duration: ${videoInfo.duration}`);
        console.log(`Captions Available: ${videoInfo.captionsAvailable?.length || 0}`);
        console.log('✅ get_video_info passed\n');
        
        // Test 3: get_timed_transcript
        console.log('Test 3: get_timed_transcript()');
        console.log('-'.repeat(50));
        const timedSegments = await get_timed_transcript({ url: TEST_VIDEO_URL });
        console.log(`Total segments: ${timedSegments.length}`);
        
        if (timedSegments.length > 0) {
            const firstSegment = timedSegments[0];
            const lastSegment = timedSegments[timedSegments.length - 1];
            
            console.log(`First segment: [${firstSegment.start}s - ${firstSegment.end}s] "${firstSegment.text}"`);
            console.log(`Last segment: [${lastSegment.start}s - ${lastSegment.end}s] "${lastSegment.text}"`);
            
            // Calculate duration
            const durationMinutes = (lastSegment.end / 60).toFixed(2);
            console.log(`Total duration: ${durationMinutes} minutes`);
            
            // Calculate words per minute
            const totalWords = timedSegments.reduce((sum, seg) => sum + seg.text.split(' ').length, 0);
            const wordsPerMinute = (totalWords / (lastSegment.end / 60)).toFixed(1);
            console.log(`Total words: ${totalWords} (~${wordsPerMinute} words/min)`);
        }
        console.log('✅ get_timed_transcript passed\n');
        
        // Test 4: get_transcript
        console.log('Test 4: get_transcript()');
        console.log('-'.repeat(50));
        const plainTranscript = await get_transcript({ url: TEST_VIDEO_URL });
        const wordCount = plainTranscript.split(' ').length;
        const charCount = plainTranscript.length;
        
        console.log(`Plain transcript length: ${charCount} characters`);
        console.log(`Word count: ${wordCount} words`);
        console.log(`Preview (first 200 chars):\n  "${plainTranscript.substring(0, 200)}..."`);
        console.log('✅ get_transcript passed\n');
        
        // Summary
        console.log('='.repeat(50));
        console.log('✅ All tests passed successfully!');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

runTests();
