// Test the yt-dlp integration
import { getYouTubeTranscript } from './src/adapters/web_extraction_ytdlp';

async function testYtDlpIntegration() {
    const videoUrl = 'https://www.youtube.com/watch?v=lxRAj1Gijic';
    
    console.log('=== Testing yt-dlp Integration ===');
    console.log('Video URL:', videoUrl);
    console.log('---\n');
    
    try {
        console.log('📥 Downloading transcript...');
        const segments = await getYouTubeTranscript(videoUrl, 'en');
        
        console.log(`✅ Success! Found ${segments.length} segments`);
        console.log('---\n');
        
        if (segments.length > 0) {
            console.log('First 5 segments:');
            segments.slice(0, 5).forEach((seg, i) => {
                console.log(`[${i + 1}] ${seg.start.toFixed(2)}s → ${seg.end.toFixed(2)}s`);
                console.log(`    "${seg.text}"`);
                console.log(`    Source: ${seg.source}, Lang: ${seg.lang}`);
            });
            
            console.log('\n---\n');
            
            console.log('Last 3 segments:');
            segments.slice(-3).forEach((seg, i) => {
                console.log(`[${segments.length - 2 + i}] ${seg.start.toFixed(2)}s → ${seg.end.toFixed(2)}s`);
                console.log(`    "${seg.text}"`);
            });
            
            console.log('\n---\n');
            
            const totalDuration = segments[segments.length - 1].end;
            const totalWords = segments.reduce((sum, seg) => sum + seg.text.split(' ').length, 0);
            
            console.log('📊 Summary:');
            console.log(`- Total segments: ${segments.length}`);
            console.log(`- Duration: ${totalDuration.toFixed(2)}s (${(totalDuration / 60).toFixed(2)} minutes)`);
            console.log(`- Total words: ${totalWords}`);
            console.log(`- Average words/minute: ${((totalWords / totalDuration) * 60).toFixed(1)}`);
            console.log(`- Language: ${segments[0].lang}`);
            console.log(`- Source: ${segments[0].source}`);
        }
        
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error:', err.message);
        console.error('Stack:', err.stack);
    }
}

testYtDlpIntegration();
