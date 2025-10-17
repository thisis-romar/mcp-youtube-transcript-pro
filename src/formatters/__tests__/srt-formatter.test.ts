import { formatAsSRT } from '../srt-formatter';
import type { TranscriptSegment } from '../../types';

// Helper to create test segments
const seg = (start: number, end: number, text: string): TranscriptSegment => ({
    start, end, text, lang: 'en', source: 'web_extraction'
});

describe('SRT Formatter', () => {
    it('should return empty string for empty input', () => {
        expect(formatAsSRT([])).toBe('');
    });

    it('should format single segment correctly', () => {
        const result = formatAsSRT([seg(0.5, 2.3, 'Hello world')]);
        expect(result).toContain('1\n');
        expect(result).toContain('00:00:00,500 --> 00:00:02,300');
        expect(result).toContain('Hello world');
    });

    it('should format multiple segments with sequence numbers', () => {
        const segments = [seg(0, 1, 'First'), seg(1, 2, 'Second'), seg(2, 3, 'Third')];
        const result = formatAsSRT(segments);
        expect(result).toContain('1\n');
        expect(result).toContain('2\n');
        expect(result).toContain('3\n');
    });

    it('should use comma separator in timestamps', () => {
        const result = formatAsSRT([seg(1.5, 3.7, 'Test')]);
        expect(result).toContain('00:00:01,500 --> 00:00:03,700');
        expect(result).not.toMatch(/\d\.\d{3}/);
    });

    it('should decode HTML entities', () => {
        const result = formatAsSRT([seg(0, 2, '&amp; &lt; &gt; &quot; &apos;')]);
        expect(result).toContain('& < > " \'');
        expect(result).not.toContain('&amp;');
    });

    it('should handle special characters', () => {
        const segments = [seg(0, 2, 'Special: @#$%'), seg(2, 4, 'Unicode: 你好 🎉')];
        const result = formatAsSRT(segments);
        expect(result).toContain('Special: @#$%');
        expect(result).toContain('Unicode: 你好 🎉');
    });

    it('should handle quotes in text', () => {
        const result = formatAsSRT([seg(0, 2, 'He said "hello" and \'goodbye\'')]);
        expect(result).toContain('"hello"');
        expect(result).toContain('\'goodbye\'');
    });

    it('should preserve newlines in text', () => {
        const result = formatAsSRT([seg(0, 3, 'Line one\nLine two')]);
        expect(result).toContain('Line one\nLine two');
    });

    it('should handle long videos (> 1 hour)', () => {
        const segments = [seg(3661, 3665, 'After one hour'), seg(7200, 7205, 'After two hours')];
        const result = formatAsSRT(segments);
        expect(result).toContain('01:01:01,000 --> 01:01:05,000');
        expect(result).toContain('02:00:00,000 --> 02:00:05,000');
    });

    it('should handle edge case timestamps', () => {
        const segments = [seg(0.001, 0.002, 'Very short'), seg(359999, 360000, 'Very long')];
        const result = formatAsSRT(segments);
        expect(result).toContain('00:00:00,001 --> 00:00:00,002');
        expect(result).toContain('99:59:59,000 --> 100:00:00,000');
    });

    it('should separate segments with blank lines', () => {
        const result = formatAsSRT([seg(0, 1, 'First'), seg(1, 2, 'Second')]);
        expect(result).toMatch(/First\n\n\d+\n/);
    });

    it('should normalize whitespace', () => {
        const result = formatAsSRT([seg(0, 2, '  Multiple   spaces  ')]);
        expect(result).toContain('Multiple spaces');
    });

    it('should handle empty text', () => {
        const result = formatAsSRT([seg(0, 1, ''), seg(1, 2, 'Not empty')]);
        expect(result).toContain('1\n');
        expect(result).toContain('2\n');
    });

    it('should create proper SRT structure', () => {
        const result = formatAsSRT([seg(0, 1, 'Test')]);
        const lines = result.split('\n');
        expect(lines[0]).toBe('1');
        expect(lines[1]).toMatch(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/);
        expect(lines[2]).toBe('Test');
        expect(lines[3]).toBe('');
    });

    it('should handle large number of segments', () => {
        const segments = Array.from({ length: 100 }, (_, i) => seg(i, i + 1, `Segment ${i + 1}`));
        const result = formatAsSRT(segments);
        expect(result).toContain('1\n');
        expect(result).toContain('50\n');
        expect(result).toContain('100\n');
    });
});
