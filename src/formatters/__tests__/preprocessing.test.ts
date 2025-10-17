/**
 * Unit tests for preprocessing functions
 * 
 * Tests filterEmptySegments, mergeOverlappingSegments, and removeSilenceMarkers
 */

import { filterEmptySegments, mergeOverlappingSegments, removeSilenceMarkers } from '../../preprocessing';
import { TranscriptSegment } from '../../types';

// Helper function to create test segments
function createSegment(start: number, end: number, text: string): TranscriptSegment {
    return {
        start,
        end,
        text,
        lang: 'en',
        source: 'youtube_api_auto'
    };
}

describe('filterEmptySegments', () => {
    test('removes segments with empty text', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, ''),
            createSegment(2, 3, 'World')
        ];
        
        const result = filterEmptySegments(segments);
        
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('Hello');
        expect(result[1].text).toBe('World');
    });
    
    test('removes segments with whitespace-only text', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '   '),
            createSegment(2, 3, '\t'),
            createSegment(3, 4, '\n'),
            createSegment(4, 5, '  \t\n  '),
            createSegment(5, 6, 'World')
        ];
        
        const result = filterEmptySegments(segments);
        
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('Hello');
        expect(result[1].text).toBe('World');
    });
    
    test('returns empty array when all segments are empty', () => {
        const segments = [
            createSegment(0, 1, ''),
            createSegment(1, 2, '  '),
            createSegment(2, 3, '\t\n')
        ];
        
        const result = filterEmptySegments(segments);
        
        expect(result).toHaveLength(0);
    });
    
    test('returns all segments when none are empty', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, 'World'),
            createSegment(2, 3, 'Test')
        ];
        
        const result = filterEmptySegments(segments);
        
        expect(result).toHaveLength(3);
        expect(result).toEqual(segments);
    });
    
    test('preserves segments with only special characters', () => {
        const segments = [
            createSegment(0, 1, '.'),
            createSegment(1, 2, '-'),
            createSegment(2, 3, '!')
        ];
        
        const result = filterEmptySegments(segments);
        
        expect(result).toHaveLength(3);
    });
    
    test('handles empty input array', () => {
        const result = filterEmptySegments([]);
        expect(result).toHaveLength(0);
    });
});

describe('mergeOverlappingSegments', () => {
    test('merges two segments with overlapping timestamps', () => {
        const segments = [
            createSegment(0, 1.5, 'Hello'),
            createSegment(1.2, 2.5, 'world')
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0].start).toBe(0);
        expect(result[0].end).toBe(2.5);
        expect(result[0].text).toBe('Hello world');
    });
    
    test('does not merge segments without overlap', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, 'world'),
            createSegment(2, 3, 'test')
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result).toHaveLength(3);
        expect(result).toEqual(segments);
    });
    
    test('merges multiple consecutive overlapping segments', () => {
        const segments = [
            createSegment(0, 1.5, 'The'),
            createSegment(1.2, 2.8, 'quick'),
            createSegment(2.5, 3.5, 'brown'),
            createSegment(3.2, 4.0, 'fox')
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe('The quick brown fox');
        expect(result[0].start).toBe(0);
        expect(result[0].end).toBe(4.0);
    });
    
    test('handles partial overlaps correctly', () => {
        const segments = [
            createSegment(0, 1.5, 'Hello'),
            createSegment(1.2, 2.0, 'world'),
            createSegment(3.0, 4.0, 'test'),
            createSegment(3.5, 5.0, 'case')
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('Hello world');
        expect(result[1].text).toBe('test case');
    });
    
    test('preserves first segment language and source', () => {
        const segments: TranscriptSegment[] = [
            { start: 0, end: 1.5, text: 'Hello', lang: 'en', source: 'youtube_api_manual' },
            { start: 1.2, end: 2.5, text: 'world', lang: 'es', source: 'web_extraction' }
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0].lang).toBe('en');
        expect(result[0].source).toBe('youtube_api_manual');
    });
    
    test('handles empty input array', () => {
        const result = mergeOverlappingSegments([]);
        expect(result).toHaveLength(0);
    });
    
    test('handles single segment', () => {
        const segments = [createSegment(0, 1, 'Hello')];
        const result = mergeOverlappingSegments(segments);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(segments[0]);
    });
    
    test('trims text before concatenation', () => {
        const segments = [
            createSegment(0, 1.5, 'Hello  '),
            createSegment(1.2, 2.5, '  world  ')
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result[0].text).toBe('Hello world');
    });
    
    test('uses min start and max end times', () => {
        const segments = [
            createSegment(1.0, 2.5, 'Hello'),
            createSegment(0.5, 2.0, 'world')
        ];
        
        const result = mergeOverlappingSegments(segments);
        
        expect(result[0].start).toBe(0.5); // min(1.0, 0.5)
        expect(result[0].end).toBe(2.5);   // max(2.5, 2.0)
    });
});

describe('removeSilenceMarkers', () => {
    test('removes [silence] markers (case-insensitive)', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '[silence]'),
            createSegment(2, 3, '[SILENCE]'),
            createSegment(3, 4, '[Silence]'),
            createSegment(4, 5, 'World')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe('Hello');
        expect(result[1].text).toBe('World');
    });
    
    test('removes [pause] markers (case-insensitive)', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '[pause]'),
            createSegment(2, 3, '[PAUSE]'),
            createSegment(3, 4, 'World')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
    });
    
    test('removes [Music] markers (case-insensitive)', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '[Music]'),
            createSegment(2, 3, '[MUSIC]'),
            createSegment(3, 4, '[music]'),
            createSegment(4, 5, 'World')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
    });
    
    test('removes single period markers', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '.'),
            createSegment(2, 3, 'World')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
    });
    
    test('removes single dash markers', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '-'),
            createSegment(2, 3, 'World')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
    });
    
    test('removes empty and whitespace-only segments', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, ''),
            createSegment(2, 3, '   '),
            createSegment(3, 4, '\t'),
            createSegment(4, 5, 'World')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
    });
    
    test('does not remove valid text containing silence words', () => {
        const segments = [
            createSegment(0, 1, 'The silence was deafening'),
            createSegment(1, 2, 'A pause for thought'),
            createSegment(2, 3, 'I love music')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(3);
        expect(result).toEqual(segments);
    });
    
    test('does not remove periods in sentences', () => {
        const segments = [
            createSegment(0, 1, 'Hello.'),
            createSegment(1, 2, 'World.'),
            createSegment(2, 3, 'Test...')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(3);
    });
    
    test('handles mixed silence markers and valid text', () => {
        const segments = [
            createSegment(0, 1, 'Hello'),
            createSegment(1, 2, '[silence]'),
            createSegment(2, 3, 'World'),
            createSegment(3, 4, '.'),
            createSegment(4, 5, 'Test'),
            createSegment(5, 6, '[Music]'),
            createSegment(6, 7, 'End')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(4);
        expect(result[0].text).toBe('Hello');
        expect(result[1].text).toBe('World');
        expect(result[2].text).toBe('Test');
        expect(result[3].text).toBe('End');
    });
    
    test('returns empty array when all segments are silence markers', () => {
        const segments = [
            createSegment(0, 1, '[silence]'),
            createSegment(1, 2, '[pause]'),
            createSegment(2, 3, '[Music]'),
            createSegment(3, 4, '.'),
            createSegment(4, 5, '-')
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(0);
    });
    
    test('handles empty input array', () => {
        const result = removeSilenceMarkers([]);
        expect(result).toHaveLength(0);
    });
    
    test('preserves all segment properties for non-silence segments', () => {
        const segments: TranscriptSegment[] = [
            { start: 0, end: 1, text: 'Hello', lang: 'en', source: 'youtube_api_manual' },
            { start: 1, end: 2, text: '[silence]', lang: 'en', source: 'youtube_api_auto' },
            { start: 2, end: 3, text: 'World', lang: 'es', source: 'web_extraction' }
        ];
        
        const result = removeSilenceMarkers(segments);
        
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(segments[0]);
        expect(result[1]).toEqual(segments[2]);
    });
});

describe('Combined preprocessing operations', () => {
    test('removeSilence → filterEmpty → mergeOverlaps works correctly', () => {
        const segments = [
            createSegment(0, 1.5, 'Hello'),
            createSegment(1.2, 2.0, '[silence]'),  // Overlaps with "Hello"
            createSegment(2.0, 3.5, 'world'),
            createSegment(3.2, 4.0, ''),            // Overlaps with "world"
            createSegment(4.5, 5.5, 'test')
        ];
        
        // Apply preprocessing in order
        let result = removeSilenceMarkers(segments);  // Removes [silence]
        result = filterEmptySegments(result);         // Removes empty string
        result = mergeOverlappingSegments(result);    // Merges "Hello" (0-1.5) with "world" (2.0-3.5) - no overlap!
        
        // After removeSilence: Hello (0-1.5), world (2.0-3.5), test (4.5-5.5)
        // After filterEmpty: Same (empty was already removed)
        // After mergeOverlaps: No overlaps, so all 3 remain separate
        expect(result).toHaveLength(3);
        expect(result[0].text).toBe('Hello');
        expect(result[1].text).toBe('world');
        expect(result[2].text).toBe('test');
    });
});
