import { google } from 'googleapis';
import { VideoInfo, CaptionTrack } from '../types';

const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Fetches video metadata from the YouTube Data API.
 */
export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
    if (!API_KEY) {
        throw new Error("YOUTUBE_API_KEY environment variable not set.");
    }
    const response = await youtube.videos.list({
        auth: API_KEY,
        part: ['snippet', 'contentDetails'],
        id: [videoId],
    });

    const item = response.data.items?.[0];
    if (!item) {
        throw new Error(`Video with ID ${videoId} not found.`);
    }

    return {
        title: item.snippet?.title ?? 'No title',
        channelId: item.snippet?.channelId ?? 'Unknown channel',
        duration: item.contentDetails?.duration ?? 'PT0S',
        captionsAvailable: [], // This would be populated by listCaptionTracks
    };
}

/**
 * Lists available caption tracks for a video.
 */
export async function listCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
    if (!API_KEY) {
        throw new Error("YOUTUBE_API_KEY environment variable not set.");
    }
    const response = await youtube.captions.list({
        auth: API_KEY,
        part: ['snippet'],
        videoId: videoId,
    });

    return response.data.items?.map((item: any) => ({
        lang: item.snippet?.language ?? 'unknown',
        source: item.snippet?.trackKind === 'ASR' ? 'youtube_api_auto' : 'youtube_api_manual',
    })) ?? [];
}
