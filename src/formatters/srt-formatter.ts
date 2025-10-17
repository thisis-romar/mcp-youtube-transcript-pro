import { TranscriptSegment } from '../types';
import { formatTimestampSRT } from './timestamp-utils';

/**
 * Sanitizes text for SRT subtitle format
 * - Trims whitespace
 * - Decodes common HTML entities
 * - Normalizes excessive newlines
 * - Normalizes spaces and tabs
 * 
 * @param text - Raw transcript text
 * @returns Sanitized text safe for SRT format
 */
function sanitizeText(text: string): string {
  return text
    .trim()
    // Decode HTML entities (YouTube transcripts may contain these)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Normalize excessive newlines (max 2 consecutive for paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')
    // Normalize spaces and tabs
    .replace(/[ \t]+/g, ' ');
}

/**
 * Formats transcript segments as SubRip (SRT) subtitle file
 * 
 * SRT Format Structure:
 * ```
 * 1
 * 00:00:00,000 --> 00:00:03,500
 * First subtitle text
 * 
 * 2
 * 00:00:03,500 --> 00:00:07,000
 * Second subtitle text
 * ```
 * 
 * Specification:
 * - Sequential numbering starting from 1
 * - Timestamp format: HH:MM:SS,mmm (comma separator)
 * - Timestamp range: start --> end
 * - Subtitle text (can be multi-line)
 * - Blank line separator between entries
 * 
 * @param segments - Array of transcript segments with start time, duration, and text
 * @returns SRT formatted string ready to save as .srt file
 * 
 * @example
 * ```typescript
 * const segments = [
 *   { start: 0, end: 3.5, text: "Hello world", lang: "en", source: "youtube_api_manual" },
 *   { start: 3.5, end: 7.0, text: "This is a test", lang: "en", source: "youtube_api_manual" }
 * ];
 * const srt = formatAsSRT(segments);
 * // Returns:
 * // 1
 * // 00:00:00,000 --> 00:00:03,500
 * // Hello world
 * //
 * // 2
 * // 00:00:03,500 --> 00:00:07,000
 * // This is a test
 * ```
 */
export function formatAsSRT(segments: TranscriptSegment[]): string {
  // Handle empty input
  if (segments.length === 0) {
    return '';
  }

  const srtEntries = segments.map((segment, index) => {
    // Sequence number (1-indexed)
    const sequenceNumber = index + 1;
    
    // Format timestamps with comma separator
    const startTime = formatTimestampSRT(segment.start);
    
    // Use segment end time directly (ensuring it's never before start time)
    const endSeconds = Math.max(segment.end, segment.start);
    const endTime = formatTimestampSRT(endSeconds);
    
    // Sanitize subtitle text
    const text = sanitizeText(segment.text);
    
    // Build SRT entry: sequence number, timestamp range, text
    return `${sequenceNumber}\n${startTime} --> ${endTime}\n${text}`;
  });

  // Join entries with blank line separator and add final newline
  return srtEntries.join('\n\n') + '\n';
}
