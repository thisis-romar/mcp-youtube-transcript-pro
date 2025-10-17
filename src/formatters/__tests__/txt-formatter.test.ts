import { formatAsTXT } from '../txt-formatter';
import type { TranscriptSegment } from '../../types';

const seg = (start: number, end: number, text: string): TranscriptSegment => ({
    start, end, text, lang: 'en', source: 'web_extraction'
});

describe('TXT Formatter', () => {
    it('should format as plain text by default', () => {
        const segments = [seg(0, 1, 'Hello'), seg(1, 2, 'world'), seg(2, 3, 'test')];
        const result = formatAsTXT(segments);
        expect(result).toBe('Hello world test\n'); // Includes trailing newline
    });

    it('should join segments with spaces in plain mode', () => {
        const segments = [seg(0, 1, 'First'), seg(1, 2, 'second'), seg(2, 3, 'third')];
        const result = formatAsTXT(segments);
        expect(result).toContain('First second third');
    });

    it('should handle empty input', () => {
        const result = formatAsTXT([]);
        expect(result).toBe('');
    });

    it('should format with timestamps when mode is timestamped', () => {
        const segments = [seg(0, 1, 'Hello'), seg(1, 2, 'world')];
        const result = formatAsTXT(segments, { mode: 'timestamped' });
        expect(result).toMatch(/\[00:00:00\] Hello/);
        expect(result).toMatch(/\[00:00:01\] world/);
    });

    it('should include metadata header for timestamped mode', () => {
        const segments = [seg(0, 1, 'Test')];
        const result = formatAsTXT(segments, { mode: 'timestamped', includeMetadata: true });
        expect(result).toContain('=== Transcript Export ==='); // Actual header text
        expect(result).toContain('Exported:');
    });

    it('should format in paragraph mode with time gaps', () => {
        const segments = [
            seg(0, 1, 'First'),
            seg(1, 2, 'second'),
            seg(10, 11, 'After gap'), // 8 second gap
            seg(11, 12, 'continues')
        ];
        const result = formatAsTXT(segments, { mode: 'paragraph' });
        expect(result).toContain('First second');
        expect(result).toContain('After gap continues');
        expect(result).toMatch(/\n\n/); // Paragraph separator
    });

    it('should use custom paragraph gap when specified', () => {
        const segments = [
            seg(0, 1, 'First'),
            seg(2, 3, 'Second'), // 1 second gap
            seg(5, 6, 'Third') // 2 second gap
        ];
        const result = formatAsTXT(segments, { mode: 'paragraph', paragraphGap: 1.5 });
        // Second should be in new paragraph (gap > 1.5), Third also new paragraph
        expect(result.split('\n\n').length).toBeGreaterThan(1);
    });

    it('should handle special characters in plain mode', () => {
        const segments = [seg(0, 2, 'Special: @#$%'), seg(2, 4, 'Unicode: 你好 🎉')];
        const result = formatAsTXT(segments);
        expect(result).toContain('Special: @#$%');
        expect(result).toContain('Unicode: 你好 🎉');
    });

    it('should handle quotes in text', () => {
        const segments = [seg(0, 2, 'He said "hello" and \'goodbye\'')];
        const result = formatAsTXT(segments);
        expect(result).toContain('"hello"');
        expect(result).toContain('\'goodbye\'');
    });

    it('should preserve spaces between words', () => {
        const segments = [seg(0, 1, 'word1'), seg(1, 2, 'word2'), seg(2, 3, 'word3')];
        const result = formatAsTXT(segments);
        expect(result).toBe('word1 word2 word3\n'); // Includes trailing newline
    });

    it('should handle empty text segments', () => {
        const segments = [seg(0, 1, 'Hello'), seg(1, 2, ''), seg(2, 3, 'world')];
        const result = formatAsTXT(segments);
        expect(result).toContain('Hello');
        expect(result).toContain('world');
    });

    it('should handle long videos in timestamped mode', () => {
        const segments = [seg(3661, 3665, 'After one hour')];
        const result = formatAsTXT(segments, { mode: 'timestamped' });
        expect(result).toContain('[01:01:01]');
    });

    it('should format timestamps as HH:MM:SS by default', () => {
        const segments = [seg(125, 130, 'Test')];
        const result = formatAsTXT(segments, { mode: 'timestamped' });
        expect(result).toContain('[00:02:05]');
    });

    it('should use specified timestamp format in timestamped mode', () => {
        const segments = [seg(125.5, 130, 'Test')];
        const result = formatAsTXT(segments, { mode: 'timestamped', timestampFormat: 'hms-millis' });
        expect(result).toContain('[00:02:05.500]');
    });

    it('should handle metadata flag correctly', () => {
        const segments = [seg(0, 1, 'Test')];
        const withMetadata = formatAsTXT(segments, { mode: 'timestamped', includeMetadata: true });
        const withoutMetadata = formatAsTXT(segments, { mode: 'timestamped', includeMetadata: false });
        
        expect(withMetadata).toContain('=== Transcript Export ==='); // Actual header text
        expect(withoutMetadata).not.toContain('=== Transcript Export ===');
    });

    it('should handle large number of segments in plain mode', () => {
        const segments = Array.from({ length: 100 }, (_, i) => seg(i, i + 1, `word${i + 1}`));
        const result = formatAsTXT(segments);
        expect(result).toContain('word1 word2');
        expect(result).toContain('word99 word100');
    });

    it('should handle large number of segments in timestamped mode', () => {
        const segments = Array.from({ length: 50 }, (_, i) => seg(i, i + 1, `Segment ${i + 1}`));
        const result = formatAsTXT(segments, { mode: 'timestamped' });
        expect(result).toContain('[00:00:00] Segment 1');
        expect(result).toContain('[00:00:49] Segment 50');
    });

    it('should create proper paragraph breaks based on time gaps', () => {
        const segments = [
            seg(0, 1, 'Para1a'),
            seg(1, 2, 'Para1b'),
            seg(10, 11, 'Para2a'), // Large gap
            seg(11, 12, 'Para2b')
        ];
        const result = formatAsTXT(segments, { mode: 'paragraph', paragraphGap: 2 });
        const paragraphs = result.split('\n\n');
        expect(paragraphs.length).toBe(2);
        expect(paragraphs[0]).toContain('Para1a Para1b');
        expect(paragraphs[1]).toContain('Para2a Para2b');
    });
});
