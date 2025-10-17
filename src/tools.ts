import { getYouTubeTranscript } from './adapters/web_extraction';
import { getVideoInfo as getYouTubeVideoInfo, listCaptionTracks } from './adapters/youtube_api';
import { ToolInput, TranscriptSegment, VideoInfo, CaptionTrack } from './types';

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    throw new Error('Invalid YouTube URL or video ID');
}

/**
 * Lists available caption tracks for a YouTube video.
 */
export async function list_tracks(input: ToolInput): Promise<CaptionTrack[]> {
    const videoId = extractVideoId(input.url);
    return await listCaptionTracks(videoId);
}

/**
 * Returns a merged plain transcript.
 */
export async function get_transcript(input: ToolInput): Promise<string> {
    const segments = await get_timed_transcript(input);
    return segments.map(s => s.text).join(' ');
}

/**
 * Returns an array of timestamped transcript segments.
 */
export async function get_timed_transcript(input: ToolInput): Promise<TranscriptSegment[]> {
    const language = input.lang || 'en';
    
    // Try to get transcript using yt-dlp (web extraction)
    // In the future, we could check YouTube API first and fall back to this
    try {
        const segments = await getYouTubeTranscript(input.url, language);
        
        if (segments.length === 0) {
            throw new Error('No transcript segments found');
        }
        
        return segments;
    } catch (error) {
        const err = error as Error;
        throw new Error(`Failed to get transcript: ${err.message}`);
    }
}

/**
 * Returns video metadata.
 */
export async function get_video_info(input: ToolInput): Promise<VideoInfo> {
    const videoId = extractVideoId(input.url);
    const videoInfo = await getYouTubeVideoInfo(videoId);
    
    // Optionally add caption tracks to the video info
    try {
        const tracks = await listCaptionTracks(videoId);
        videoInfo.captionsAvailable = tracks;
    } catch {
        // If listing captions fails, just return video info without caption details
        videoInfo.captionsAvailable = [];
    }
    
    return videoInfo;
}
