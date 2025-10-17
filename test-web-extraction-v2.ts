// Test youtube-transcript library with explicit language parameter
import { YoutubeTranscript } from 'youtube-transcript';

async function testWithLanguage() {
    const videoUrl = 'https://www.youtube.com/watch?v=lxRAj1Gijic';
    
    console.log('=== Testing youtube-transcript with explicit language ===');
    console.log('Video URL:', videoUrl);
    console.log('---\n');
    
    try {
        // Try with explicit language
        console.log('Attempting with lang="en"...');
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl, {
            lang: 'en'
        });
        
        console.log(`✅ Success! Found ${transcript.length} segments`);
        
        if (transcript.length > 0) {
            console.log('\nFirst 5 segments:');
            transcript.slice(0, 5).forEach((item, index) => {
                const start = (item.offset / 1000).toFixed(2);
                const end = ((item.offset + item.duration) / 1000).toFixed(2);
                console.log(`[${index + 1}] ${start}s - ${end}s: "${item.text}"`);
            });
            
            const totalDuration = (transcript[transcript.length - 1].offset + transcript[transcript.length - 1].duration) / 1000;
            console.log(`\nTotal duration: ${totalDuration.toFixed(2)}s (${(totalDuration / 60).toFixed(2)} min)`);
        }
        
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error:', err.message);
        console.error('\nTrying without language parameter...\n');
        
        try {
            const transcript2 = await YoutubeTranscript.fetchTranscript(videoUrl);
            console.log(`✅ Success without lang! Found ${transcript2.length} segments`);
            
            if (transcript2.length > 0) {
                console.log('\nFirst segment:');
                const item = transcript2[0];
                console.log(`${(item.offset / 1000).toFixed(2)}s: "${item.text}"`);
            }
        } catch (error2) {
            const err2 = error2 as Error;
            console.error('❌ Also failed without lang:', err2.message);
        }
    }
}

testWithLanguage();
