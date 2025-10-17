import { formatAsCSV } from '../csv-formatter';
import type { TranscriptSegment } from '../../types';

const seg = (start: number, end: number, text: string): TranscriptSegment => ({
    start, end, text, lang: 'en', source: 'web_extraction'
});

describe('CSV Formatter', () => {
    it('should include BOM for Excel compatibility', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')]);
        expect(result.charCodeAt(0)).toBe(0xFEFF);
    });

    it('should include header row by default', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')]);
        expect(result).toContain('Sequence,Start,End,Duration,Text,Language,Source');
    });

    it('should format single segment correctly', () => {
        const result = formatAsCSV([seg(0.5, 2.3, 'Hello world')]);
        const lines = result.split('\n').filter(l => l.trim());
        expect(lines.length).toBe(2); // Header + 1 data row
        expect(lines[1]).toContain('1,'); // Sequence number
        expect(lines[1]).toContain('0.500'); // Start time
        expect(lines[1]).toContain('2.300'); // End time
        expect(lines[1]).toContain('Hello world');
    });

    it('should have 7 columns', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')]);
        const lines = result.substring(1).split('\n'); // Skip BOM
        const headerCols = lines[0].split(',').length;
        expect(headerCols).toBe(7);
    });

    it('should escape quotes in text', () => {
        const result = formatAsCSV([seg(0, 2, 'He said "hello"')]);
        expect(result).toContain('\"He said \"\"hello\"\"\"');
    });

    it('should wrap fields with commas', () => {
        const result = formatAsCSV([seg(0, 2, 'Hello, world')]);
        expect(result).toContain('\"Hello, world\"');
    });

    it('should wrap fields with newlines', () => {
        const result = formatAsCSV([seg(0, 3, 'Line one\nLine two')]);
        expect(result).toContain('\"Line one\nLine two\"');
    });

    it('should handle special characters', () => {
        const segments = [seg(0, 2, 'Special: @#$%'), seg(2, 4, 'Unicode: 你好 🎉')];
        const result = formatAsCSV(segments);
        expect(result).toContain('Special: @#$%');
        expect(result).toContain('Unicode: 你好 🎉');
    });

    it('should calculate duration correctly', () => {
        const result = formatAsCSV([seg(0.5, 2.7, 'Test')]);
        expect(result).toContain('2.200'); // Duration: 2.7 - 0.5 = 2.2
    });

    it('should handle long videos (> 1 hour)', () => {
        const segments = [seg(3661, 3665, 'After one hour')];
        const result = formatAsCSV(segments);
        expect(result).toContain('3661.000');
        expect(result).toContain('3665.000');
    });

    it('should handle edge case timestamps', () => {
        const segments = [seg(0.001, 0.002, 'Very short'), seg(359999, 360000, 'Very long')];
        const result = formatAsCSV(segments);
        expect(result).toContain('0.001');
        expect(result).toContain('359999.000');
    });

    it('should format with hms timestamps when specified', () => {
        const result = formatAsCSV([seg(65, 125, 'Test')], { timestampFormat: 'hms' });
        expect(result).toContain('00:01:05');
        expect(result).toContain('00:02:05');
    });

    it('should format with hms-millis timestamps when specified', () => {
        const result = formatAsCSV([seg(65.123, 125.456, 'Test')], { timestampFormat: 'hms-millis' });
        expect(result).toContain('00:01:05.123');
        expect(result).toContain('00:02:05.456');
    });

    it('should use seconds format by default', () => {
        const result = formatAsCSV([seg(65.5, 125.7, 'Test')]);
        expect(result).toContain('65.500');
        expect(result).toContain('125.700');
    });

    it('should include language column', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')]);
        expect(result).toContain(',en,');
    });

    it('should include source column', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')]);
        expect(result).toContain(',web_extraction');
    });

    it('should handle empty text', () => {
        const result = formatAsCSV([seg(0, 1, '')]);
        const lines = result.substring(1).split('\n');
        expect(lines.length).toBeGreaterThan(1); // Has header and data row
    });

    it('should handle large number of segments', () => {
        const segments = Array.from({ length: 100 }, (_, i) => seg(i, i + 1, `Segment ${i + 1}`));
        const result = formatAsCSV(segments);
        const lines = result.substring(1).split('\n').filter(l => l.trim());
        expect(lines.length).toBe(101); // Header + 100 data rows
    });

    it('should disable BOM when specified', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')], { includeBOM: false });
        expect(result.charCodeAt(0)).not.toBe(0xFEFF);
    });

    it('should disable header when specified', () => {
        const result = formatAsCSV([seg(0, 1, 'Test')], { includeHeader: false });
        expect(result).not.toContain('Sequence,Start,End');
    });
});
