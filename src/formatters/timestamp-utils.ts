/**
 * Timestamp Utility Functions
 * 
 * Converts seconds-based timestamps to various formatted strings
 * used by different subtitle formats (SRT, VTT, CSV, etc.)
 */

/**
 * Format timestamp for SRT format (SubRip)
 * Uses comma as decimal separator: HH:MM:SS,mmm
 * 
 * @param seconds - Time in seconds (can be fractional)
 * @returns Formatted timestamp string (e.g., "00:01:23,456")
 * 
 * @example
 * formatTimestampSRT(83.456) // "00:01:23,456"
 * formatTimestampSRT(3661.789) // "01:01:01,789"
 * formatTimestampSRT(0.001) // "00:00:00,001"
 */
export function formatTimestampSRT(seconds: number): string {
    return formatTimestamp(seconds, ',');
}

/**
 * Format timestamp for VTT format (WebVTT)
 * Uses period as decimal separator: HH:MM:SS.mmm
 * 
 * @param seconds - Time in seconds (can be fractional)
 * @returns Formatted timestamp string (e.g., "00:01:23.456")
 * 
 * @example
 * formatTimestampVTT(83.456) // "00:01:23.456"
 * formatTimestampVTT(3661.789) // "01:01:01.789"
 */
export function formatTimestampVTT(seconds: number): string {
    return formatTimestamp(seconds, '.');
}

/**
 * Format timestamp for CSV exports
 * Supports multiple formats via options
 * 
 * @param seconds - Time in seconds (can be fractional)
 * @param format - Output format: 'seconds', 'hms', or 'hms-millis' (default)
 * @returns Formatted timestamp string
 * 
 * @example
 * formatTimestampCSV(83.456, 'seconds') // "83.456"
 * formatTimestampCSV(83.456, 'hms') // "00:01:23"
 * formatTimestampCSV(83.456, 'hms-millis') // "00:01:23.456"
 */
export function formatTimestampCSV(
    seconds: number,
    format: 'seconds' | 'hms' | 'hms-millis' = 'hms-millis'
): string {
    switch (format) {
        case 'seconds':
            return seconds.toFixed(3);
        case 'hms':
            return formatTimestamp(seconds, '', false); // No milliseconds
        case 'hms-millis':
        default:
            return formatTimestamp(seconds, '.');
    }
}

/**
 * Core timestamp formatting function
 * Handles the conversion from seconds to HH:MM:SS format
 * 
 * @param seconds - Time in seconds
 * @param decimalSeparator - Character to use for milliseconds (',' or '.')
 * @param includeMillis - Whether to include milliseconds (default: true)
 * @returns Formatted timestamp string
 */
function formatTimestamp(
    seconds: number,
    decimalSeparator: string = '.',
    includeMillis: boolean = true
): string {
    // Handle negative values (edge case)
    if (seconds < 0) {
        console.warn(`Negative timestamp detected: ${seconds}s, using 0 instead`);
        seconds = 0;
    }

    // Extract components
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.round((seconds % 1) * 1000);

    // Format with zero-padding
    const h = padZero(hours, 2);
    const m = padZero(minutes, 2);
    const s = padZero(secs, 2);
    
    if (!includeMillis) {
        return `${h}:${m}:${s}`;
    }
    
    const ms = padZero(millis, 3);
    return `${h}:${m}:${s}${decimalSeparator}${ms}`;
}

/**
 * Pad a number with leading zeros
 * 
 * @param num - Number to pad
 * @param width - Desired width (number of digits)
 * @returns Zero-padded string
 * 
 * @example
 * padZero(5, 2) // "05"
 * padZero(123, 3) // "123"
 * padZero(7, 3) // "007"
 */
function padZero(num: number, width: number): string {
    return num.toString().padStart(width, '0');
}

/**
 * Parse a formatted timestamp back to seconds
 * Useful for validation and testing
 * 
 * @param timestamp - Formatted timestamp (HH:MM:SS.mmm or HH:MM:SS,mmm)
 * @returns Time in seconds
 * 
 * @example
 * parseTimestamp("00:01:23.456") // 83.456
 * parseTimestamp("01:01:01,789") // 3661.789
 */
export function parseTimestamp(timestamp: string): number {
    // Normalize decimal separator to period
    const normalized = timestamp.replace(',', '.');
    
    // Split into components
    const parts = normalized.split(':');
    if (parts.length !== 3) {
        throw new Error(`Invalid timestamp format: ${timestamp}`);
    }
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const secondsAndMillis = parseFloat(parts[2]);
    
    // Validate ranges
    if (minutes > 59 || secondsAndMillis >= 60) {
        throw new Error(`Invalid timestamp values: ${timestamp}`);
    }
    
    return hours * 3600 + minutes * 60 + secondsAndMillis;
}

/**
 * Calculate duration between two timestamps
 * 
 * @param start - Start time in seconds
 * @param end - End time in seconds
 * @returns Duration in seconds
 */
export function calculateDuration(start: number, end: number): number {
    const duration = end - start;
    return duration >= 0 ? duration : 0;
}

/**
 * Format duration as human-readable string
 * 
 * @param seconds - Duration in seconds
 * @returns Formatted duration (e.g., "1h 23m 45s")
 * 
 * @example
 * formatDuration(83) // "1m 23s"
 * formatDuration(3661) // "1h 1m 1s"
 * formatDuration(45) // "45s"
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}
