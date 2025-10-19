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
    
    /**
     * Optional file path to write formatted transcript content
     * 
     * When provided, the tool writes the formatted output directly to the specified
     * file and returns a success message with metadata instead of the large content
     * string. This prevents conversation context overflow with large transcript files
     * (200KB+ SRT/VTT files).
     * 
     * Supports:
     * - **Absolute paths**: `/home/user/transcript.srt` or `C:\Users\user\transcript.srt`
     * - **Relative paths**: `./output.srt` or `transcripts/output.vtt`
     * - **Auto-creation**: Parent directories are created automatically if they don't exist
     * 
     * Returns:
     * - Success message with metadata: format, file size, segment count, file path
     * - Error message if write fails (permissions, disk space, invalid path)
     * 
     * Use cases:
     * - Avoid context overflow with large videos (1hr+ = 200KB+ files)
     * - Direct file output for automation workflows
     * - Save formatted transcripts without displaying in conversation
     * 
     * @example
     * ```typescript
     * // Relative path
     * { url: 'video-id', format: 'srt', outputFile: './transcript.srt' }
     * 
     * // Absolute path
     * { url: 'video-id', format: 'vtt', outputFile: '/path/to/output.vtt' }
     * ```
     * 
     * @default undefined (returns content directly)
     */
    outputFile?: string;
    
    /**
     * Truncate response content to prevent conversation context overflow
     * 
     * When set, the tool truncates the returned content to the specified character
     * limit. This allows viewing a preview of large transcripts without overwhelming
     * the conversation context. Works independently or in combination with `outputFile`.
     * 
     * Behavior:
     * - **boolean true**: Use default 5000 character limit
     * - **number**: Custom character limit (minimum 1)
     * - **false/undefined**: No truncation (returns full content)
     * 
     * Format-specific truncation:
     * - **JSON format**: Returns structured preview object with metadata
     *   - Includes truncated segments array
     *   - Shows segmentsShown, totalSegments, segmentsOmitted counts
     * - **Text formats** (SRT/VTT/CSV/TXT): Returns truncated string
     *   - Appends message: "... [Preview truncated, N more characters omitted] ..."
     * 
     * Combined with outputFile:
     * - Full content written to file
     * - Truncated preview returned in conversation
     * - Success message + preview both included in response
     * 
     * Use cases:
     * - Preview large transcripts before deciding to save
     * - Show first few minutes of long video transcripts
     * - Reduce conversation context usage while maintaining visibility
     * - Quick content verification without full download
     * 
     * @example
     * ```typescript
     * // Default 5000 character preview
     * { url: 'video-id', format: 'srt', preview: true }
     * 
     * // Custom 1000 character preview
     * { url: 'video-id', format: 'json', preview: 1000 }
     * 
     * // Combined: full file + preview in conversation
     * { url: 'video-id', format: 'vtt', outputFile: './output.vtt', preview: true }
     * ```
     * 
     * @default undefined (no truncation)
     */
    preview?: boolean | number;
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
