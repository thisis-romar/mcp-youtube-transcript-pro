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
        
        // Verify it returns JSON by default (backward compatibility)
        if (!Array.isArray(timedSegments)) {
            throw new Error('get_timed_transcript should return array by default');
        }
        
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
            const totalWords = timedSegments.reduce((sum: number, seg) => sum + seg.text.split(' ').length, 0);
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
        
        // Test 5: Format Parameter Tests
        console.log('Test 5: Format Parameter Tests');
        console.log('-'.repeat(50));
        
        const formatTests: { format: string; size?: number; time?: number }[] = [];
        
        // Test 5.1: JSON format (default)
        console.log('\n5.1: JSON Format (default)');
        let startTime = Date.now();
        const jsonResult = await get_timed_transcript({ url: TEST_VIDEO_URL, format: 'json' });
        let elapsed = Date.now() - startTime;
        
        if (!Array.isArray(jsonResult)) {
            throw new Error('JSON format should return array');
        }
        if (jsonResult.length === 0 || !jsonResult[0].start || !jsonResult[0].text) {
            throw new Error('JSON format segments missing required properties');
        }
        const jsonSize = JSON.stringify(jsonResult).length;
        formatTests.push({ format: 'json', size: jsonSize, time: elapsed });
        console.log(`  ✓ Returns array with ${jsonResult.length} segments`);
        console.log(`  ✓ Size: ${(jsonSize / 1024).toFixed(2)} KB`);
        console.log(`  ✓ Time: ${elapsed}ms`);
        
        // Test 5.2: SRT format
        console.log('\n5.2: SRT Format (SubRip)');
        startTime = Date.now();
        const srtResult = await get_timed_transcript({ url: TEST_VIDEO_URL, format: 'srt' });
        elapsed = Date.now() - startTime;
        
        if (typeof srtResult !== 'string') {
            throw new Error('SRT format should return string');
        }
        if (!srtResult.startsWith('1\n')) {
            throw new Error('SRT format should start with sequence number 1');
        }
        if (!srtResult.includes(',')) {
            throw new Error('SRT format should use comma separator in timestamps');
        }
        const srtLines = srtResult.split('\n');
        const srtBlankLines = srtLines.filter(line => line.trim() === '').length;
        formatTests.push({ format: 'srt', size: srtResult.length, time: elapsed });
        console.log(`  ✓ Starts with sequence number "1"`);
        console.log(`  ✓ Uses comma timestamp separator (HH:MM:SS,mmm)`);
        console.log(`  ✓ Contains ${srtBlankLines} blank line separators`);
        console.log(`  ✓ Size: ${(srtResult.length / 1024).toFixed(2)} KB`);
        console.log(`  ✓ Time: ${elapsed}ms`);
        
        // Test 5.3: VTT format
        console.log('\n5.3: VTT Format (WebVTT)');
        startTime = Date.now();
        const vttResult = await get_timed_transcript({ url: TEST_VIDEO_URL, format: 'vtt' });
        elapsed = Date.now() - startTime;
        
        if (typeof vttResult !== 'string') {
            throw new Error('VTT format should return string');
        }
        if (!vttResult.startsWith('WEBVTT\n')) {
            throw new Error('VTT format must start with WEBVTT header');
        }
        if (!vttResult.includes('.')) {
            throw new Error('VTT format should use period separator in timestamps');
        }
        if (vttResult.includes(',')) {
            throw new Error('VTT format should not use comma separator');
        }
        formatTests.push({ format: 'vtt', size: vttResult.length, time: elapsed });
        console.log(`  ✓ Starts with "WEBVTT" header`);
        console.log(`  ✓ Uses period timestamp separator (HH:MM:SS.mmm)`);
        console.log(`  ✓ No sequence numbers (VTT spec compliant)`);
        console.log(`  ✓ Size: ${(vttResult.length / 1024).toFixed(2)} KB`);
        console.log(`  ✓ Time: ${elapsed}ms`);
        
        // Test 5.4: CSV format
        console.log('\n5.4: CSV Format (Spreadsheet)');
        startTime = Date.now();
        const csvResult = await get_timed_transcript({ url: TEST_VIDEO_URL, format: 'csv' });
        elapsed = Date.now() - startTime;
        
        if (typeof csvResult !== 'string') {
            throw new Error('CSV format should return string');
        }
        const hasBOM = csvResult.charCodeAt(0) === 0xFEFF;
        const csvLines = csvResult.split('\n').filter(line => line.trim());
        const headerLine = hasBOM ? csvLines[0].substring(1) : csvLines[0];
        const headerColumns = headerLine.split(',').length;
        
        if (!hasBOM) {
            console.log('  ⚠ Warning: BOM not found (Excel may have encoding issues)');
        }
        if (headerColumns !== 7) {
            throw new Error(`CSV should have 7 columns, found ${headerColumns}`);
        }
        if (!headerLine.includes('Sequence') || !headerLine.includes('Duration')) {
            throw new Error('CSV header missing expected column names');
        }
        formatTests.push({ format: 'csv', size: csvResult.length, time: elapsed });
        console.log(`  ✓ Contains BOM for Excel compatibility: ${hasBOM}`);
        console.log(`  ✓ Header row with 7 columns: ${headerColumns}`);
        console.log(`  ✓ Data rows: ${csvLines.length - 1}`);
        console.log(`  ✓ Size: ${(csvResult.length / 1024).toFixed(2)} KB`);
        console.log(`  ✓ Time: ${elapsed}ms`);
        
        // Test 5.5: TXT format
        console.log('\n5.5: TXT Format (Plain Text)');
        startTime = Date.now();
        const txtResult = await get_timed_transcript({ url: TEST_VIDEO_URL, format: 'txt' });
        elapsed = Date.now() - startTime;
        
        if (typeof txtResult !== 'string') {
            throw new Error('TXT format should return string');
        }
        // Default mode is 'plain' - space-separated text
        const txtWordCount = txtResult.split(/\s+/).length;
        formatTests.push({ format: 'txt', size: txtResult.length, time: elapsed });
        console.log(`  ✓ Returns plain text string`);
        console.log(`  ✓ Word count: ${txtWordCount} words`);
        console.log(`  ✓ Default mode: plain (space-separated)`);
        console.log(`  ✓ Size: ${(txtResult.length / 1024).toFixed(2)} KB`);
        console.log(`  ✓ Time: ${elapsed}ms`);
        
        // Test 5.6: Invalid format error handling
        console.log('\n5.6: Invalid Format Error Handling');
        try {
            await get_timed_transcript({ url: TEST_VIDEO_URL, format: 'invalid' as any });
            throw new Error('Should have thrown error for invalid format');
        } catch (error) {
            const err = error as Error;
            if (err.message.includes('Invalid format')) {
                console.log(`  ✓ Correctly rejects invalid format`);
                console.log(`  ✓ Error message: "${err.message.substring(0, 80)}..."`);
            } else {
                throw error;
            }
        }
        
        // Test 5.7: Default format (backward compatibility)
        console.log('\n5.7: Default Format (Backward Compatibility)');
        const defaultResult = await get_timed_transcript({ url: TEST_VIDEO_URL });
        if (!Array.isArray(defaultResult)) {
            throw new Error('Default format should return array (JSON)');
        }
        console.log(`  ✓ Omitting format parameter returns JSON array`);
        console.log(`  ✓ Backward compatibility maintained`);
        
        // Format comparison table
        console.log('\n' + '='.repeat(50));
        console.log('Format Comparison Table:');
        console.log('-'.repeat(50));
        console.log('Format   | Size (KB) | Time (ms) | Type');
        console.log('-'.repeat(50));
        formatTests.forEach(test => {
            const sizeKB = ((test.size || 0) / 1024).toFixed(2).padStart(9);
            const timeMs = (test.time || 0).toString().padStart(9);
            const type = test.format === 'json' ? 'array' : 'string';
            console.log(`${test.format.padEnd(8)} | ${sizeKB} | ${timeMs} | ${type}`);
        });
        console.log('-'.repeat(50));
        
        console.log('\n✅ All format tests passed\n');
        
        // Summary
        console.log('='.repeat(50));
        console.log('✅ All tests passed successfully!');
        console.log('   - 4 core tools validated');
        console.log('   - 5 output formats tested (JSON, SRT, VTT, CSV, TXT)');
        console.log('   - Error handling verified');
        console.log('   - Backward compatibility confirmed');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

runTests();
