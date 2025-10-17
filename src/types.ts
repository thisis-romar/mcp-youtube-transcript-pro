export interface ToolInput {
    url: string;
    lang?: string;
}

export interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
    lang: string;
    source: 'youtube_api_manual' | 'youtube_api_auto' | 'web_extraction' | 'asr';
}

export interface VideoInfo {
    title: string;
    channelId: string;
    duration: string; // ISO 8601 duration format
    captionsAvailable: CaptionTrack[];
}

export interface CaptionTrack {
    lang: string;
    source: 'youtube_api_manual' | 'youtube_api_auto';
}
