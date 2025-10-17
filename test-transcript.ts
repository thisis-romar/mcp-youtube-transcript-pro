// Quick test script to verify youtube-transcript library works
import { YoutubeTranscript } from 'youtube-transcript';

async function testTranscript() {
    const videoUrl = 'https://www.youtube.com/watch?v=lxRAj1Gijic';
    
    console.log('Testing transcript extraction for:', videoUrl);
    console.log('---');
    
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        
        console.log(`✅ Success! Found ${transcript.length} segments`);
        
        if (transcript.length === 0) {
            console.log('⚠️  No transcript segments found.');
            console.log('This could mean:');
            console.log('  - The video has no captions/subtitles');
            console.log('  - Captions are disabled by the creator');
            console.log('  - The video is age-restricted or private');
            return;
        }
        
        console.log('---');
        console.log('First 3 segments:');
        transcript.slice(0, 3).forEach((item, index) => {
            const start = (item.offset / 1000).toFixed(2);
            const end = ((item.offset + item.duration) / 1000).toFixed(2);
            console.log(`[${index + 1}] ${start}s - ${end}s: "${item.text}"`);
        });
        
        console.log('---');
        console.log('Last 3 segments:');
        transcript.slice(-3).forEach((item, index) => {
            const start = (item.offset / 1000).toFixed(2);
            const end = ((item.offset + item.duration) / 1000).toFixed(2);
            console.log(`[${index + 1}] ${start}s - ${end}s: "${item.text}"`);
        });
        
        console.log('---');
        const totalDuration = (transcript[transcript.length - 1].offset + transcript[transcript.length - 1].duration) / 1000;
        console.log(`Total duration covered: ${totalDuration.toFixed(2)} seconds (${(totalDuration / 60).toFixed(2)} minutes)`);
        
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error:', err.message);
        if (err.stack) {
            console.error('Stack:', err.stack);
        }
    }
}

// Test with a known-good video as well
async function testKnownGoodVideo() {
    // This is a popular video that should have captions
    const knownGoodUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    console.log('\n\n=== Testing with known-good video ===');
    console.log('URL:', knownGoodUrl);
    console.log('---');
    
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(knownGoodUrl);
        console.log(`✅ Library works! Found ${transcript.length} segments`);
        
        if (transcript.length > 0) {
            console.log('Sample segment:', {
                start: (transcript[0].offset / 1000).toFixed(2) + 's',
                text: transcript[0].text
            });
        }
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error with known-good video:', err.message);
    }
}

async function main() {
    await testTranscript();
    await testKnownGoodVideo();
}

main();
