import { TranscriptSegment } from '../types';
import { formatTimestampCSV } from './timestamp-utils';
import { CSVFormatOptions } from './index';

/**
 * Escapes a field value for CSV format according to RFC 4180
 * 
 * Rules:
 * - Fields containing comma, quote, newline, or carriage return must be enclosed in quotes
 * - Quotes within fields must be escaped by doubling them (" becomes "")
 * - Numbers don't require escaping
 * 
 * @param field - Field value to escape
 * @returns Escaped field value safe for CSV
 * 
 * @example
 * ```typescript
 * escapeCSVField('Hello, world')  // Returns: "Hello, world"
 * escapeCSVField('He said "Hi"')  // Returns: "He said ""Hi"""
 * escapeCSVField('Line 1\nLine 2') // Returns: "Line 1\nLine 2"
 * escapeCSVField(123)             // Returns: "123"
 * ```
 */
function escapeCSVField(field: string | number): string {
  // Numbers don't need escaping
  if (typeof field === 'number') {
    return field.toString();
  }
  
  // Check if field needs escaping (contains comma, quote, newline, or carriage return)
  const needsEscaping = /[",\n\r]/.test(field);
  
  if (needsEscaping) {
    // Escape quotes by doubling them
    const escaped = field.replace(/"/g, '""');
    // Wrap in quotes
    return `"${escaped}"`;
  }
  
  // No escaping needed
  return field;
}

/**
 * Formats transcript segments as CSV (Comma-Separated Values) file
 * 
 * CSV Format Structure:
 * ```csv
 * Sequence,Start,End,Duration,Text,Language,Source
 * 1,0.000,3.500,3.500,"First subtitle text",en,youtube_api_manual
 * 2,3.500,7.000,3.500,"Second subtitle text",en,youtube_api_manual
 * ```
 * 
 * Columns:
 * - Sequence: 1-indexed sequence number
 * - Start: Start timestamp (format configurable)
 * - End: End timestamp (format configurable)
 * - Duration: Duration in same format as timestamps
 * - Text: Subtitle text (properly escaped for CSV)
 * - Language: Language code (e.g., "en", "es", "fr")
 * - Source: Transcript source (youtube_api_manual, youtube_api_auto, web_extraction, asr)
 * 
 * Features:
 * - Configurable timestamp formats (seconds, HH:MM:SS, HH:MM:SS.mmm)
 * - RFC 4180 compliant CSV escaping
 * - Optional BOM for Excel compatibility
 * - Optional header row
 * - Handles special characters (commas, quotes, newlines) in text
 * 
 * Use Cases:
 * - Import into Excel or Google Sheets
 * - Data analysis with pandas, R, SQL
 * - Database imports
 * - Spreadsheet-based editing workflows
 * 
 * @param segments - Array of transcript segments
 * @param options - CSV formatting options
 * @returns CSV formatted string ready to save as .csv file
 * 
 * @example Basic usage (default options)
 * ```typescript
 * const segments = [
 *   { start: 0, end: 3.5, text: "Hello", lang: "en", source: "youtube_api_manual" },
 *   { start: 3.5, end: 7.0, text: "World", lang: "en", source: "youtube_api_manual" }
 * ];
 * const csv = formatAsCSV(segments);
 * // Returns:
 * // [BOM]Sequence,Start,End,Duration,Text,Language,Source
 * // 1,0.000,3.500,3.500,Hello,en,youtube_api_manual
 * // 2,3.500,7.000,3.500,World,en,youtube_api_manual
 * ```
 * 
 * @example With HMS timestamp format
 * ```typescript
 * const csv = formatAsCSV(segments, { timestampFormat: 'hms-millis' });
 * // Returns:
 * // [BOM]Sequence,Start,End,Duration,Text,Language,Source
 * // 1,00:00:00.000,00:00:03.500,00:00:03.500,Hello,en,youtube_api_manual
 * ```
 * 
 * @example Without header and BOM
 * ```typescript
 * const csv = formatAsCSV(segments, { 
 *   includeHeader: false, 
 *   includeBOM: false 
 * });
 * // Returns just data rows (useful for appending to existing CSV)
 * ```
 * 
 * @example Handling special characters
 * ```typescript
 * const segments = [
 *   { start: 0, end: 5, text: 'He said, "Hello!"', lang: "en", source: "youtube_api_auto" }
 * ];
 * const csv = formatAsCSV(segments);
 * // Text field will be properly escaped: "He said, ""Hello!"""
 * ```
 */
export function formatAsCSV(
  segments: TranscriptSegment[],
  options: CSVFormatOptions = {}
): string {
  // Apply default options
  const timestampFormat = options.timestampFormat || 'seconds';
  const includeBOM = options.includeBOM !== false; // Default true
  const includeHeader = options.includeHeader !== false; // Default true
  
  // BOM (Byte Order Mark) for UTF-8 - helps Excel recognize UTF-8 encoding
  const bom = includeBOM ? '\uFEFF' : '';
  
  // CSV header row
  const header = includeHeader 
    ? 'Sequence,Start,End,Duration,Text,Language,Source\n'
    : '';
  
  // Handle empty input - return BOM and header (if requested)
  if (segments.length === 0) {
    return bom + header;
  }
  
  // Build CSV rows
  const rows = segments.map((segment, index) => {
    // Sequence number (1-indexed)
    const sequence = index + 1;
    
    // Format timestamps according to specified format
    const start = formatTimestampCSV(segment.start, timestampFormat);
    const end = formatTimestampCSV(segment.end, timestampFormat);
    
    // Calculate duration (ensure non-negative)
    const durationSeconds = Math.max(0, segment.end - segment.start);
    const duration = formatTimestampCSV(durationSeconds, timestampFormat);
    
    // Escape text field (most likely to contain special characters)
    const text = escapeCSVField(segment.text);
    
    // Language and source don't typically need escaping but we apply it for consistency
    const lang = escapeCSVField(segment.lang);
    const source = escapeCSVField(segment.source);
    
    // Build CSV row: Sequence,Start,End,Duration,Text,Language,Source
    return `${sequence},${start},${end},${duration},${text},${lang},${source}`;
  });
  
  // Combine BOM, header, and rows with final newline
  return bom + header + rows.join('\n') + '\n';
}
