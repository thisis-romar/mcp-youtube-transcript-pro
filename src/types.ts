// Re-export format types from formatters module for convenience
import type { FormatType, CSVFormatOptions, TXTFormatOptions } from './formatters';
export type { FormatType, CSVFormatOptions, TXTFormatOptions };

/**
 * Input parameters for MCP tools
 */
export interface ToolInput {
    /** YouTube video URL or video ID */
    url: string;
    
    /** 
     * Language code for captions (e.g., 'en', 'es', 'fr')
     * If not specified, uses the default caption track
     */
    lang?: string;
    
    /**
     * Output format for transcript data
     * 
     * Available formats:
     * - **'json'** (default): Structured JSON array with segments
     *   - Use for: API integration, programming, structured data
     *   - Returns: TranscriptSegment[] array
     * 
     * - **'srt'**: SubRip subtitle format (.srt)
     *   - Use for: Video editing (Premiere, Final Cut), subtitle files
     *   - Features: Sequence numbers, comma-separated timestamps
     * 
     * - **'vtt'**: WebVTT web subtitle format (.vtt)
     *   - Use for: Web video players, HTML5 video, accessibility
     *   - Features: WEBVTT header, period-separated timestamps
     * 
     * - **'csv'**: Comma-separated values (.csv)
     *   - Use for: Excel, Google Sheets, data analysis, SQL imports
     *   - Features: 7 columns (Sequence, Start, End, Duration, Text, Language, Source)
     * 
     * - **'txt'**: Plain text (.txt)
     *   - Use for: Reading, word counting, text analysis
     *   - Features: Multiple modes (plain, timestamped, paragraph)
     * 
     * @default 'json'
     */
    format?: FormatType;
    
    /**
     * Remove segments with empty or whitespace-only text
     * 
     * When enabled, filters out segments where the text is empty, contains only spaces,
     * tabs, or newlines. Useful for cleaning auto-generated captions that include
     * timing markers for pauses or silent periods.
     * 
     * Use cases:
     * - Clean up auto-generated YouTube captions
     * - Remove timing gaps from transcripts
     * - Prepare transcripts for text analysis
     * 
     * @default false
     */
    filterEmpty?: boolean;
    
    /**
     * Merge segments with overlapping timestamps
     * 
     * When enabled, combines consecutive segments where the end time of one segment
     * is after the start time of the next (end[n] > start[n+1]). The merged segment
     * uses the earliest start time and latest end time, with text concatenated using
     * a space separator.
     * 
     * Use cases:
     * - Fix word-level timing overlaps in auto-generated captions
     * - Create more natural phrase groupings
     * - Reduce segment count while preserving all content
     * 
     * @default false
     */
    mergeOverlaps?: boolean;
    
    /**
     * Remove silence and pause markers from transcript
     * 
     * When enabled, filters out segments that contain silence indicators commonly
     * found in auto-generated captions. Removes segments matching patterns like:
     * [silence], [pause], [Music], single periods or dashes, and empty text.
     * 
     * More aggressive than filterEmpty - removes known silence markers even if
     * they have non-whitespace content.
     * 
     * Use cases:
     * - Create clean reading transcripts
     * - Remove music and sound effect markers
     * - Prepare transcripts for text-to-speech
     * 
     * @default false
     */
    removeSilence?: boolean;
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
