/**
 * Preprocessing Functions for Transcript Segments
 * 
 * This module provides pure functions for preprocessing transcript segments
 * before formatting. All functions are composable and maintain segment integrity.
 */

import { TranscriptSegment } from './types';

/**
 * Filter out segments with empty or whitespace-only text
 * 
 * Removes segments where the text contains only whitespace characters
 * (spaces, tabs, newlines) or is completely empty. Useful for cleaning
 * auto-generated captions that include timing markers for silent periods.
 * 
 * @param segments - Array of transcript segments to filter
 * @returns New array with only non-empty segments
 * 
 * @example
 * ```typescript
 * const segments = [
 *   { start: 0, end: 1, text: "Hello", lang: "en", source: "youtube_api_auto" },
 *   { start: 1, end: 2, text: "  ", lang: "en", source: "youtube_api_auto" },
 *   { start: 2, end: 3, text: "World", lang: "en", source: "youtube_api_auto" }
 * ];
 * const filtered = filterEmptySegments(segments);
 * // Returns: [{ text: "Hello", ... }, { text: "World", ... }]
 * ```
 */
export function filterEmptySegments(segments: TranscriptSegment[]): TranscriptSegment[] {
    return segments.filter(segment => segment.text.trim().length > 0);
}

/**
 * Merge segments with overlapping timestamps
 * 
 * Combines consecutive segments where the end time of segment[n] is after
 * the start time of segment[n+1]. This commonly occurs in word-level
 * auto-generated captions where timing boundaries overlap slightly.
 * 
 * Merging behavior:
 * - Start time: Uses the earliest start time (min of both segments)
 * - End time: Uses the latest end time (max of both segments)
 * - Text: Concatenates with a single space separator
 * - Language: Preserves from first segment
 * - Source: Preserves from first segment
 * 
 * @param segments - Array of transcript segments to merge
 * @returns New array with overlapping segments merged
 * 
 * @example
 * ```typescript
 * const segments = [
 *   { start: 0, end: 1.5, text: "Hello", lang: "en", source: "youtube_api_auto" },
 *   { start: 1.2, end: 2.5, text: "world", lang: "en", source: "youtube_api_auto" }
 * ];
 * const merged = mergeOverlappingSegments(segments);
 * // Returns: [{ start: 0, end: 2.5, text: "Hello world", ... }]
 * ```
 */
export function mergeOverlappingSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
    if (segments.length === 0) {
        return segments;
    }
    
    const merged: TranscriptSegment[] = [];
    let current = { ...segments[0] };
    
    for (let i = 1; i < segments.length; i++) {
        const next = segments[i];
        
        // Check if current segment overlaps with next segment
        // Overlap occurs when: current.end > next.start
        if (current.end > next.start) {
            // Merge segments: extend time range and concatenate text
            current.start = Math.min(current.start, next.start);
            current.end = Math.max(current.end, next.end);
            current.text = current.text.trim() + ' ' + next.text.trim();
        } else {
            // No overlap: save current segment and move to next
            merged.push(current);
            current = { ...next };
        }
    }
    
    // Don't forget to add the last segment
    merged.push(current);
    
    return merged;
}

/**
 * Remove silence and pause markers from transcript
 * 
 * Filters out segments that contain silence indicators commonly found in
 * auto-generated captions. This is more aggressive than filterEmptySegments
 * as it removes segments with specific marker patterns.
 * 
 * Removed patterns:
 * - [silence] (case-insensitive)
 * - [pause] (case-insensitive)
 * - [Music] (case-insensitive)
 * - Single period: "."
 * - Single dash: "-"
 * - Empty or whitespace-only text
 * 
 * @param segments - Array of transcript segments to filter
 * @returns New array with silence markers removed
 * 
 * @example
 * ```typescript
 * const segments = [
 *   { start: 0, end: 1, text: "Hello", lang: "en", source: "youtube_api_auto" },
 *   { start: 1, end: 2, text: "[silence]", lang: "en", source: "youtube_api_auto" },
 *   { start: 2, end: 3, text: "[Music]", lang: "en", source: "youtube_api_auto" },
 *   { start: 3, end: 4, text: "World", lang: "en", source: "youtube_api_auto" }
 * ];
 * const filtered = removeSilenceMarkers(segments);
 * // Returns: [{ text: "Hello", ... }, { text: "World", ... }]
 * ```
 */
export function removeSilenceMarkers(segments: TranscriptSegment[]): TranscriptSegment[] {
    // Define regex patterns for silence markers
    const silencePatterns = [
        /^\[silence\]$/i,      // [silence] (case-insensitive)
        /^\[pause\]$/i,        // [pause] (case-insensitive)
        /^\[music\]$/i,        // [Music] (case-insensitive)
        /^\.$/,                // Single period
        /^-$/,                 // Single dash
        /^\s*$/                // Empty or whitespace-only
    ];
    
    return segments.filter(segment => {
        const text = segment.text.trim();
        
        // Keep segment if it doesn't match any silence pattern
        return !silencePatterns.some(pattern => pattern.test(text));
    });
}
