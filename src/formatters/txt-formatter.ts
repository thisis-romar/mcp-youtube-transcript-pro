import { TranscriptSegment } from '../types';
import { formatTimestampCSV } from './timestamp-utils';
import { TXTFormatOptions } from './index';

/**
 * Generates metadata header for transcript
 * Includes export timestamp, language, source, segment count, and total duration
 * 
 * @param segments - Array of transcript segments
 * @returns Formatted metadata header with separator lines
 */
function generateMetadataHeader(segments: TranscriptSegment[]): string {
  if (segments.length === 0) {
    return '';
  }
  
  // Get metadata from segments
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  
  // Calculate total duration
  const totalDuration = lastSegment.end;
  const durationFormatted = formatTimestampCSV(totalDuration, 'hms');
  
  // Current timestamp (ISO format, readable)
  const exportTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  return [
    '=== Transcript Export ===',
    `Exported: ${exportTime}`,
    `Language: ${firstSegment.lang}`,
    `Source: ${firstSegment.source}`,
    `Segments: ${segments.length}`,
    `Duration: ${durationFormatted}`,
    '========================',
    ''  // Blank line after header
  ].join('\n');
}

/**
 * Formats transcript in plain mode (space-separated text)
 * Mimics the current get_transcript behavior
 * 
 * @param segments - Array of transcript segments
 * @returns All text concatenated with spaces
 */
function formatPlain(segments: TranscriptSegment[]): string {
  return segments
    .map(segment => segment.text.trim())
    .join(' ');
}

/**
 * Formats transcript in timestamped mode
 * Each segment on a new line with [HH:MM:SS] timestamp prefix
 * 
 * @param segments - Array of transcript segments
 * @param timestampFormat - Format for timestamps ('hms' or 'hms-millis')
 * @returns Timestamped text with one line per segment
 */
function formatTimestamped(
  segments: TranscriptSegment[],
  timestampFormat: 'hms' | 'hms-millis'
): string {
  return segments
    .map(segment => {
      const timestamp = formatTimestampCSV(segment.start, timestampFormat);
      const text = segment.text.trim();
      return `[${timestamp}] ${text}`;
    })
    .join('\n');
}

/**
 * Formats transcript in paragraph mode
 * Groups segments by time gaps for natural reading flow
 * 
 * Logic:
 * - Segments with small gaps (<paragraphGap) are combined into same paragraph
 * - Segments with large gaps (>=paragraphGap) start new paragraphs
 * - Paragraphs are separated by blank lines
 * 
 * @param segments - Array of transcript segments
 * @param paragraphGap - Time gap threshold in seconds (default: 2.0)
 * @returns Text grouped into natural paragraphs
 */
function formatParagraph(
  segments: TranscriptSegment[],
  paragraphGap: number
): string {
  if (segments.length === 0) {
    return '';
  }
  
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  
  segments.forEach((segment, i) => {
    // Add current segment text to paragraph
    currentParagraph.push(segment.text.trim());
    
    // Determine if we should end the current paragraph
    const isLastSegment = i === segments.length - 1;
    const hasLargeGap = !isLastSegment && 
      (segments[i + 1].start - segment.end) >= paragraphGap;
    
    if (isLastSegment || hasLargeGap) {
      // End current paragraph and start new one
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    }
  });
  
  // Join paragraphs with blank lines
  return paragraphs.join('\n\n');
}

/**
 * Formats transcript segments as plain text file
 * 
 * Three formatting modes available:
 * 
 * **Plain Mode** (default):
 * ```
 * Hello world. This is a test. Final sentence here.
 * ```
 * - Simple space-separated text
 * - Mimics current get_transcript behavior
 * - Good for: word counting, basic text analysis, search indexing
 * 
 * **Timestamped Mode**:
 * ```
 * [00:00:00] Hello world
 * [00:00:03] This is a test
 * [00:00:07] Final sentence here
 * ```
 * - One line per segment with timestamp prefix
 * - Good for: following along with video, finding specific moments, karaoke-style display
 * 
 * **Paragraph Mode**:
 * ```
 * Hello world. This is a test. Final sentence here.
 * 
 * After a longer pause, new paragraph starts. Multiple sentences flow together naturally.
 * ```
 * - Groups segments by time gaps for natural reading
 * - Good for: blog posts, documentation, articles, natural readability
 * 
 * @param segments - Array of transcript segments
 * @param options - TXT formatting options
 * @returns Formatted text ready to save as .txt file
 * 
 * @example Plain mode (default)
 * ```typescript
 * const segments = [
 *   { start: 0, end: 3, text: "Hello", lang: "en", source: "youtube_api_manual" },
 *   { start: 3, end: 6, text: "world", lang: "en", source: "youtube_api_manual" }
 * ];
 * const txt = formatAsTXT(segments);
 * // Returns: "Hello world\n"
 * ```
 * 
 * @example Timestamped mode
 * ```typescript
 * const txt = formatAsTXT(segments, { mode: 'timestamped' });
 * // Returns:
 * // [00:00:00] Hello
 * // [00:00:03] world
 * ```
 * 
 * @example Paragraph mode with metadata
 * ```typescript
 * const txt = formatAsTXT(segments, { 
 *   mode: 'paragraph', 
 *   includeMetadata: true,
 *   paragraphGap: 3.0
 * });
 * // Returns:
 * // === Transcript Export ===
 * // Exported: 2025-10-17 14:30:00
 * // Language: en
 * // Source: youtube_api_manual
 * // Segments: 2
 * // Duration: 00:00:06
 * // ========================
 * //
 * // Hello world
 * ```
 */
export function formatAsTXT(
  segments: TranscriptSegment[],
  options: TXTFormatOptions = {}
): string {
  // Apply default options
  const mode = options.mode || 'plain';
  const includeMetadata = options.includeMetadata || false;
  const paragraphGap = options.paragraphGap || 2.0;
  const timestampFormat = options.timestampFormat || 'hms';
  
  // Handle empty input
  if (segments.length === 0) {
    return '';
  }
  
  // Generate metadata header if requested
  // Note: Metadata only applies to timestamped and paragraph modes
  // Plain mode is meant to be pure text without formatting
  const header = includeMetadata && mode !== 'plain'
    ? generateMetadataHeader(segments)
    : '';
  
  // Format content based on mode
  let content: string;
  switch (mode) {
    case 'plain':
      content = formatPlain(segments);
      break;
    case 'timestamped':
      content = formatTimestamped(segments, timestampFormat);
      break;
    case 'paragraph':
      content = formatParagraph(segments, paragraphGap);
      break;
    default:
      // Fallback to plain mode for unknown modes
      content = formatPlain(segments);
  }
  
  // Combine header and content with final newline
  return header + content + '\n';
}
