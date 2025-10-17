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
// export * from './csv-formatter';
// export * from './txt-formatter';
