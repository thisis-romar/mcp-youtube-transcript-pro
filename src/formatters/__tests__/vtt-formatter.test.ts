import { formatAsVTT } from '../vtt-formatter';
import type { TranscriptSegment } from '../../types';

const seg = (start: number, end: number, text: string): TranscriptSegment => ({
    start, end, text, lang: 'en', source: 'web_extraction'
});

describe('VTT Formatter', () => {
    it('should return WEBVTT header for empty input', () => {
        expect(formatAsVTT([])).toBe('WEBVTT\n');
    });

    it('should start with WEBVTT header', () => {
        const result = formatAsVTT([seg(0, 1, 'Test')]);
        expect(result).toMatch(/^WEBVTT\n/);
    });

    it('should format single segment correctly', () => {
        const result = formatAsVTT([seg(0.5, 2.3, 'Hello world')]);
        expect(result).toContain('00:00:00.500 --> 00:00:02.300');
        expect(result).toContain('Hello world');
    });

    it('should use period separator in timestamps', () => {
        const result = formatAsVTT([seg(1.5, 3.7, 'Test')]);
        expect(result).toContain('00:00:01.500 --> 00:00:03.700');
        expect(result).not.toContain(',');
    });

    it('should NOT include sequence numbers', () => {
        const result = formatAsVTT([seg(0, 1, 'First'), seg(1, 2, 'Second')]);
        // Should not have numbered lines like SRT
        expect(result).not.toMatch(/^1\n/m);
        expect(result).not.toMatch(/^2\n/m);
    });

    it('should encode HTML entities', () => {
        const result = formatAsVTT([seg(0, 2, '& < > " \'')]);
        expect(result).toContain('&amp; &lt; &gt;');
        expect(result).not.toContain('& <');
    });

    it('should handle special characters', () => {
        const segments = [seg(0, 2, 'Special: @#$%'), seg(2, 4, 'Unicode: 你好 🎉')];
        const result = formatAsVTT(segments);
        expect(result).toContain('Special: @#$%');
        expect(result).toContain('Unicode: 你好 🎉');
    });

    it('should preserve quotes', () => {
        const result = formatAsVTT([seg(0, 2, 'He said "hello" and \'goodbye\'')]);
        expect(result).toContain('"hello"');
        expect(result).toContain('\'goodbye\'');
    });

    it('should preserve newlines', () => {
        const result = formatAsVTT([seg(0, 3, 'Line one\nLine two')]);
        expect(result).toContain('Line one\nLine two');
    });

    it('should handle long videos (> 1 hour)', () => {
        const segments = [seg(3661, 3665, 'After one hour'), seg(7200, 7205, 'After two hours')];
        const result = formatAsVTT(segments);
        expect(result).toContain('01:01:01.000 --> 01:01:05.000');
        expect(result).toContain('02:00:00.000 --> 02:00:05.000');
    });

    it('should handle edge case timestamps', () => {
        const segments = [seg(0.001, 0.002, 'Very short'), seg(359999, 360000, 'Very long')];
        const result = formatAsVTT(segments);
        expect(result).toContain('00:00:00.001 --> 00:00:00.002');
        expect(result).toContain('99:59:59.000 --> 100:00:00.000');
    });

    it('should separate cues with blank lines', () => {
        const result = formatAsVTT([seg(0, 1, 'First'), seg(1, 2, 'Second')]);
        expect(result).toMatch(/First\n\n00:00:01/);
    });

    it('should handle empty text', () => {
        const result = formatAsVTT([seg(0, 1, ''), seg(1, 2, 'Not empty')]);
        expect(result).toContain('WEBVTT');
        expect(result).toContain('Not empty');
    });

    it('should create proper VTT structure', () => {
        const result = formatAsVTT([seg(0, 1, 'Test')]);
        const lines = result.split('\n');
        expect(lines[0]).toBe('WEBVTT');
        expect(lines[1]).toBe('');
        expect(lines[2]).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}$/);
        expect(lines[3]).toBe('Test');
    });

    it('should handle large number of segments', () => {
        const segments = Array.from({ length: 100 }, (_, i) => seg(i, i + 1, `Segment ${i + 1}`));
        const result = formatAsVTT(segments);
        expect(result).toMatch(/^WEBVTT\n/);
        expect(result).toContain('Segment 1');
        expect(result).toContain('Segment 100');
    });

    it('should normalize whitespace', () => {
        const result = formatAsVTT([seg(0, 2, '  Multiple   spaces  ')]);
        expect(result).toContain('Multiple spaces');
    });
});
