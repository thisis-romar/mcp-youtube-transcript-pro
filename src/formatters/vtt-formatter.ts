import { TranscriptSegment } from '../types';
import { formatTimestampVTT } from './timestamp-utils';

/**
 * Sanitizes text for WebVTT format
 * - Trims whitespace
 * - Escapes special characters (&, <, >) as HTML entities
 * - Normalizes excessive newlines
 * - Normalizes spaces and tabs
 * 
 * Note: WebVTT supports markup tags (<v>, <i>, <b>, etc.) but YouTube
 * transcripts are plain text, so we escape all special characters.
 * 
 * @param text - Raw transcript text
 * @returns Sanitized text safe for WebVTT format
 */
function sanitizeTextVTT(text: string): string {
  return text
    .trim()
    // Escape special characters for WebVTT (must escape &, <, >)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Normalize excessive newlines (max 2 consecutive for paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')
    // Normalize spaces and tabs
    .replace(/[ \t]+/g, ' ');
}

/**
 * Formats transcript segments as WebVTT (Web Video Text Tracks) subtitle file
 * 
 * WebVTT Format Structure:
 * ```
 * WEBVTT
 * 
 * 00:00:00.000 --> 00:00:03.500
 * First subtitle text
 * 
 * 00:00:03.500 --> 00:00:07.000
 * Second subtitle text
 * ```
 * 
 * Specification Details:
 * - Must begin with "WEBVTT" header
 * - Blank line after header
 * - Timestamp format: HH:MM:SS.mmm (period separator, not comma)
 * - Timestamp range: start --> end
 * - Cue identifiers are optional (not included in this implementation)
 * - Cue text (can be multi-line)
 * - Blank line separator between cues
 * - Supports markup tags (<v>, <i>, <b>, <u>, <c>) but plain text is most common
 * 
 * Reference: W3C WebVTT Specification
 * https://www.w3.org/TR/webvtt1/
 * 
 * @param segments - Array of transcript segments with start time, end time, and text
 * @returns WebVTT formatted string ready to save as .vtt file
 * 
 * @example
 * ```typescript
 * const segments = [
 *   { start: 0, end: 3.5, text: "Hello world", lang: "en", source: "youtube_api_manual" },
 *   { start: 3.5, end: 7.0, text: "This is a test", lang: "en", source: "youtube_api_manual" }
 * ];
 * const vtt = formatAsVTT(segments);
 * // Returns:
 * // WEBVTT
 * //
 * // 00:00:00.000 --> 00:00:03.500
 * // Hello world
 * //
 * // 00:00:03.500 --> 00:00:07.000
 * // This is a test
 * ```
 * 
 * @example Voice spans (future enhancement)
 * ```typescript
 * // When speaker information is available:
 * // 00:00:00.000 --> 00:00:03.500
 * // <v Speaker Name>Hello everyone!</v>
 * ```
 */
export function formatAsVTT(segments: TranscriptSegment[]): string {
  // WebVTT files must start with the WEBVTT header
  const header = 'WEBVTT\n\n';
  
  // Handle empty input - return valid WebVTT file with header only
  if (segments.length === 0) {
    return 'WEBVTT\n';
  }

  const vttCues = segments.map((segment) => {
    // Format timestamps with period separator (WebVTT standard)
    const startTime = formatTimestampVTT(segment.start);
    
    // Use segment end time directly (ensuring it's never before start time)
    const endSeconds = Math.max(segment.end, segment.start);
    const endTime = formatTimestampVTT(endSeconds);
    
    // Sanitize cue text (escape special characters)
    const text = sanitizeTextVTT(segment.text);
    
    // Build WebVTT cue: timestamp range and text
    // Note: Cue identifiers are optional and omitted here for simplicity
    return `${startTime} --> ${endTime}\n${text}`;
  });

  // Combine header with cues, using blank line separators, and add final newline
  return header + vttCues.join('\n\n') + '\n';
}
