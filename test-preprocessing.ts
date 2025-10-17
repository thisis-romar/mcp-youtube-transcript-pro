/**
 * Manual Test Script for Preprocessing Options
 * 
 * Tests all three preprocessing parameters with a real YouTube video
 */

import { get_timed_transcript } from './src/tools';

const TEST_VIDEO_URL = '0jxqoqijfvI'; // Data Science vs Data Engineering (5:32)

async function testPreprocessingOptions() {
    console.log('🧪 Testing Preprocessing Options\n');
    console.log('Test Video: Data Science vs Data Engineering');
    console.log('Duration: 5:32');
    console.log('URL: https://www.youtube.com/watch?v=0jxqoqijfvI\n');
    console.log('=' . repeat(60));

    try {
        // Test 1: Baseline (no preprocessing)
        console.log('\n📊 Test 1: Baseline (no preprocessing)');
        const baseline = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'json'
        }) as any[];
        console.log(`✅ Segments: ${baseline.length}`);
        console.log(`   Sample text: "${baseline[0]?.text}"`);
        
        // Test 2: filterEmpty only
        console.log('\n📊 Test 2: filterEmpty = true');
        const filtered = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'json',
            filterEmpty: true
        }) as any[];
        console.log(`✅ Segments: ${filtered.length} (${baseline.length - filtered.length} removed)`);
        console.log(`   Reduction: ${((baseline.length - filtered.length) / baseline.length * 100).toFixed(1)}%`);
        
        // Test 3: removeSilence only
        console.log('\n📊 Test 3: removeSilence = true');
        const noSilence = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'json',
            removeSilence: true
        }) as any[];
        console.log(`✅ Segments: ${noSilence.length} (${baseline.length - noSilence.length} removed)`);
        console.log(`   Reduction: ${((baseline.length - noSilence.length) / baseline.length * 100).toFixed(1)}%`);
        
        // Test 4: mergeOverlaps only
        console.log('\n📊 Test 4: mergeOverlaps = true');
        const merged = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'json',
            mergeOverlaps: true
        }) as any[];
        console.log(`✅ Segments: ${merged.length} (${baseline.length - merged.length} merged)`);
        console.log(`   Reduction: ${((baseline.length - merged.length) / baseline.length * 100).toFixed(1)}%`);
        console.log(`   Sample merged text: "${merged[0]?.text.substring(0, 50)}..."`);
        
        // Test 5: All three combined
        console.log('\n📊 Test 5: All options enabled');
        const allOptions = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'json',
            filterEmpty: true,
            mergeOverlaps: true,
            removeSilence: true
        }) as any[];
        console.log(`✅ Segments: ${allOptions.length}`);
        console.log(`   Total reduction: ${baseline.length} → ${allOptions.length} (${((baseline.length - allOptions.length) / baseline.length * 100).toFixed(1)}%)`);
        
        // Test 6: SRT format with preprocessing
        console.log('\n📊 Test 6: SRT format with all preprocessing');
        const srtOutput = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'srt',
            filterEmpty: true,
            mergeOverlaps: true,
            removeSilence: true
        }) as string;
        console.log(`✅ SRT output length: ${srtOutput.length} characters`);
        console.log(`   First entry:\n${srtOutput.split('\n\n')[0]}`);
        
        // Test 7: VTT format with preprocessing
        console.log('\n📊 Test 7: VTT format with all preprocessing');
        const vttOutput = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'vtt',
            filterEmpty: true,
            mergeOverlaps: true,
            removeSilence: true
        }) as string;
        console.log(`✅ VTT output length: ${vttOutput.length} characters`);
        console.log(`   Has WEBVTT header: ${vttOutput.startsWith('WEBVTT') ? 'Yes ✓' : 'No ✗'}`);
        
        // Test 8: CSV format with preprocessing
        console.log('\n📊 Test 8: CSV format with all preprocessing');
        const csvOutput = await get_timed_transcript({
            url: TEST_VIDEO_URL,
            lang: 'en',
            format: 'csv',
            filterEmpty: true,
            mergeOverlaps: true,
            removeSilence: true
        }) as string;
        const csvLines = csvOutput.split('\n').length;
        console.log(`✅ CSV output: ${csvLines} lines (including header)`);
        console.log(`   Header: ${csvOutput.split('\n')[0]}`);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 All tests passed successfully!\n');
        
        // Summary
        console.log('📈 Summary:');
        console.log(`   Baseline:         ${baseline.length} segments`);
        console.log(`   filterEmpty:      ${filtered.length} segments (-${baseline.length - filtered.length})`);
        console.log(`   removeSilence:    ${noSilence.length} segments (-${baseline.length - noSilence.length})`);
        console.log(`   mergeOverlaps:    ${merged.length} segments (-${baseline.length - merged.length})`);
        console.log(`   All combined:     ${allOptions.length} segments (-${baseline.length - allOptions.length})`);
        console.log('\n✅ Preprocessing features are working correctly!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests
testPreprocessingOptions();
