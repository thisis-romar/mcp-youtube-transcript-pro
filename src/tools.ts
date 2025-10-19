import * as fs from 'fs/promises';
import * as path from 'path';
import { getYouTubeTranscript } from './adapters/web_extraction';
import { getVideoInfo as getYouTubeVideoInfo, listCaptionTracks } from './adapters/youtube_api';
import { ToolInput, TranscriptSegment, VideoInfo, CaptionTrack } from './types';
import { formatAsSRT } from './formatters/srt-formatter';
import { formatAsVTT } from './formatters/vtt-formatter';
import { formatAsCSV } from './formatters/csv-formatter';
import { formatAsTXT } from './formatters/txt-formatter';
import type { FormatType } from './formatters';
import { filterEmptySegments, mergeOverlappingSegments, removeSilenceMarkers } from './preprocessing';

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
    // Force JSON format to ensure we get TranscriptSegment[] array
    const segments = await get_timed_transcript({ ...input, format: 'json' }) as TranscriptSegment[];
    return segments.map(s => s.text).join(' ');
}

/**
 * Returns an array of timestamped transcript segments or formatted string.
 * 
 * @param input - Tool input containing URL, language, and optional format
 * @returns TranscriptSegment[] if format is 'json' (default), or formatted string for other formats
 * 
 * Supported formats:
 * - 'json' (default): Array of TranscriptSegment objects
 * - 'srt': SubRip subtitle format (for video editing software)
 * - 'vtt': WebVTT format (for web video players)
 * - 'csv': CSV format (for data analysis in Excel/spreadsheets)
 * - 'txt': Plain text format (customizable with options)
 * 
 * Preprocessing options:
 * - removeSilence: Remove [silence], [pause], [Music] markers
 * - filterEmpty: Remove segments with empty/whitespace-only text
 * - mergeOverlaps: Merge segments with overlapping timestamps
 */
export async function get_timed_transcript(input: ToolInput): Promise<TranscriptSegment[] | string> {
    const language = input.lang || 'en';
    const format = input.format || 'json';
    
    // Try to get transcript using yt-dlp (web extraction)
    // In the future, we could check YouTube API first and fall back to this
    try {
        let segments = await getYouTubeTranscript(input.url, language);
        
        if (segments.length === 0) {
            throw new Error('No transcript segments found');
        }
        
        // Apply preprocessing in order: removeSilence → filterEmpty → mergeOverlaps
        // This order ensures aggressive filtering first, then cleanup, then consolidation
        if (input.removeSilence) {
            segments = removeSilenceMarkers(segments);
        }
        
        if (input.filterEmpty) {
            segments = filterEmptySegments(segments);
        }
        
        if (input.mergeOverlaps) {
            segments = mergeOverlappingSegments(segments);
        }
        
        // Format the content
        let formattedContent: string | TranscriptSegment[];
        
        if (format === 'json') {
            // Return raw segments for JSON format (default, backward compatible)
            formattedContent = segments;
        } else {
            // Apply formatters for other formats
            try {
                switch (format) {
                    case 'srt':
                        formattedContent = formatAsSRT(segments);
                        break;
                    case 'vtt':
                        formattedContent = formatAsVTT(segments);
                        break;
                    case 'csv':
                        formattedContent = formatAsCSV(segments);
                        break;
                    case 'txt':
                        formattedContent = formatAsTXT(segments);
                        break;
                    default:
                        throw new Error(`Invalid format: '${format}'. Supported formats: json, srt, vtt, csv, txt`);
                }
            } catch (formatError) {
                const err = formatError as Error;
                throw new Error(`Failed to format transcript as ${format}: ${err.message}`);
            }
        }
        
        // Handle outputFile parameter
        if (input.outputFile !== undefined) {
            try {
                // Validate outputFile is not empty
                if (typeof input.outputFile !== 'string' || !input.outputFile.trim()) {
                    throw new Error('outputFile parameter cannot be an empty string');
                }
                
                // Resolve the file path (handles relative and absolute paths)
                const resolvedPath = path.resolve(input.outputFile);
                
                // Ensure parent directory exists (create recursively if needed)
                const parentDir = path.dirname(resolvedPath);
                await fs.mkdir(parentDir, { recursive: true });
                
                // Write content to file
                const contentToWrite = typeof formattedContent === 'string' 
                    ? formattedContent 
                    : JSON.stringify(formattedContent, null, 2);
                
                await fs.writeFile(resolvedPath, contentToWrite, 'utf-8');
                
                // Calculate file size
                const stats = await fs.stat(resolvedPath);
                const fileSizeKB = (stats.size / 1024).toFixed(2);
                
                // Return success message with metadata
                return `✅ Transcript successfully written to file

File: ${resolvedPath}
Format: ${format.toUpperCase()}
Size: ${fileSizeKB} KB
Segments: ${segments.length}
Duration: ${segments.length > 0 ? (segments[segments.length - 1].end / 60).toFixed(2) : 0} minutes`;
                
            } catch (fileError) {
                const err = fileError as Error;
                throw new Error(`Failed to write output file: ${err.message}`);
            }
        }
        
        // Return formatted content directly (default behavior)
        return formattedContent;
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
