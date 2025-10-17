/**
 * Formatters Module
 * 
 * This module provides various formatting utilities for transcript data.
 * Supports multiple output formats: SRT, VTT, CSV, and TXT.
 */

import { TranscriptSegment } from '../types';

/**
 * Result of a formatting operation
 */
export interface FormatterResult {
    /** The formatted content as a string */
    content: string;
    
    /** Optional metadata about the formatting operation */
    metadata?: {
        /** Number of segments processed */
        segmentCount: number;
        
        /** Total duration in seconds */
        duration: number;
        
        /** Output format type */
        format: string;
        
        /** Timestamp when the content was generated */
        generatedAt: Date;
        
        /** File size in bytes (content length) */
        fileSize: number;
        
        /** Additional format-specific metadata */
        [key: string]: any;
    };
}

/**
 * Base options interface that can be extended by specific formatters
 */
export interface FormatterOptions {
    /** Include metadata header in output */
    includeMetadata?: boolean;
    
    /** Character encoding (default: UTF-8) */
    encoding?: string;
}

/**
 * CSV-specific formatting options
 */
export interface CSVFormatOptions {
    /** 
     * Timestamp format for Start, End, and Duration columns
     * - 'seconds': Decimal seconds (e.g., 83.456)
     * - 'hms': HH:MM:SS without milliseconds (e.g., 00:01:23)
     * - 'hms-millis': HH:MM:SS.mmm with milliseconds (e.g., 00:01:23.456)
     * @default 'seconds'
     */
    timestampFormat?: 'seconds' | 'hms' | 'hms-millis';
    
    /** 
     * Include BOM (Byte Order Mark) for Excel compatibility
     * Helps Excel recognize UTF-8 encoding properly
     * @default true
     */
    includeBOM?: boolean;
    
    /** 
     * Include header row with column names
     * @default true
     */
    includeHeader?: boolean;
}

/**
 * TXT-specific formatting options
 */
export interface TXTFormatOptions {
    /** 
     * Text formatting mode
     * - 'plain': Space-separated text (mimics current get_transcript behavior)
     * - 'timestamped': Each segment on new line with [HH:MM:SS] timestamp prefix
     * - 'paragraph': Group segments by time gaps for natural reading flow
     * @default 'plain'
     */
    mode?: 'plain' | 'timestamped' | 'paragraph';
    
    /**
     * Include metadata header with transcript info
     * Header includes: export time, language, source, segment count, duration
     * Only applies to 'timestamped' and 'paragraph' modes (not 'plain')
     * @default false
     */
    includeMetadata?: boolean;
    
    /**
     * Time gap threshold (in seconds) for paragraph mode
     * Segments with gaps larger than this will start new paragraphs
     * Only applies to 'paragraph' mode
     * @default 2.0
     */
    paragraphGap?: number;
    
    /**
     * Timestamp format for timestamped mode
     * Only applies to 'timestamped' mode
     * @default 'hms'
     */
    timestampFormat?: 'hms' | 'hms-millis';
}

/**
 * Base formatter function type
 * Takes transcript segments and returns formatted content
 */
export type Formatter<T extends FormatterOptions = FormatterOptions> = (
    segments: TranscriptSegment[],
    options?: T
) => string | FormatterResult;

/**
 * Format type union for type safety
 */
export type FormatType = 'json' | 'srt' | 'vtt' | 'csv' | 'txt';

// ============================================================================
// Formatter Exports
// ============================================================================
// Individual formatters will be exported here as they are implemented

// Export timestamp utilities
export * from './timestamp-utils';

// Export individual formatters (will be implemented)
export * from './srt-formatter';
export * from './vtt-formatter';
export * from './csv-formatter';
export * from './txt-formatter';
