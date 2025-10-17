import {
    formatTimestampSRT,
    formatTimestampVTT,
    formatTimestampCSV,
    parseTimestamp,
    formatDuration,
    calculateDuration
} from '../timestamp-utils';

describe('Timestamp Utilities', () => {
    describe('formatTimestampSRT', () => {
        it('should format zero seconds correctly', () => {
            expect(formatTimestampSRT(0)).toBe('00:00:00,000');
        });

        it('should format sub-second values with milliseconds', () => {
            expect(formatTimestampSRT(0.001)).toBe('00:00:00,001');
            expect(formatTimestampSRT(0.5)).toBe('00:00:00,500');
            expect(formatTimestampSRT(0.999)).toBe('00:00:00,999');
        });

        it('should format seconds correctly', () => {
            expect(formatTimestampSRT(1)).toBe('00:00:01,000');
            expect(formatTimestampSRT(30.5)).toBe('00:00:30,500');
            expect(formatTimestampSRT(59.123)).toBe('00:00:59,123');
        });

        it('should format minutes correctly', () => {
            expect(formatTimestampSRT(60)).toBe('00:01:00,000');
            expect(formatTimestampSRT(65.456)).toBe('00:01:05,456');
            expect(formatTimestampSRT(599.789)).toBe('00:09:59,789');
        });

        it('should format hours correctly', () => {
            expect(formatTimestampSRT(3600)).toBe('01:00:00,000');
            expect(formatTimestampSRT(3661.5)).toBe('01:01:01,500');
            expect(formatTimestampSRT(7384.25)).toBe('02:03:04,250');
        });

        it('should handle long videos with hours > 99', () => {
            expect(formatTimestampSRT(359999)).toBe('99:59:59,000');
            expect(formatTimestampSRT(360000)).toBe('100:00:00,000');
            expect(formatTimestampSRT(999999)).toBe('277:46:39,000');
        });

        it('should use comma separator (SRT spec)', () => {
            const result = formatTimestampSRT(1.5);
            expect(result).toContain(',');
            expect(result).not.toContain('.');
        });

        it('should handle edge case timestamps', () => {
            expect(formatTimestampSRT(0.001)).toBe('00:00:00,001'); // Minimum precision
            expect(formatTimestampSRT(99.999)).toBe('00:01:39,999'); // High precision
        });
    });

    describe('formatTimestampVTT', () => {
        it('should format zero seconds correctly', () => {
            expect(formatTimestampVTT(0)).toBe('00:00:00.000');
        });

        it('should format sub-second values with milliseconds', () => {
            expect(formatTimestampVTT(0.001)).toBe('00:00:00.001');
            expect(formatTimestampVTT(0.5)).toBe('00:00:00.500');
        });

        it('should format seconds correctly', () => {
            expect(formatTimestampVTT(1)).toBe('00:00:01.000');
            expect(formatTimestampVTT(30.5)).toBe('00:00:30.500');
        });

        it('should format minutes and hours correctly', () => {
            expect(formatTimestampVTT(60)).toBe('00:01:00.000');
            expect(formatTimestampVTT(3600)).toBe('01:00:00.000');
            expect(formatTimestampVTT(3661.5)).toBe('01:01:01.500');
        });

        it('should use period separator (WebVTT spec)', () => {
            const result = formatTimestampVTT(1.5);
            expect(result).toContain('.');
            expect(result).not.toContain(',');
        });

        it('should handle long videos', () => {
            expect(formatTimestampVTT(359999)).toBe('99:59:59.000');
            expect(formatTimestampVTT(360000)).toBe('100:00:00.000');
        });
    });

    describe('formatTimestampCSV', () => {
        it('should format as seconds when format="seconds"', () => {
            expect(formatTimestampCSV(0, 'seconds')).toBe('0.000');
            expect(formatTimestampCSV(1.5, 'seconds')).toBe('1.500');
            expect(formatTimestampCSV(65.123, 'seconds')).toBe('65.123');
            expect(formatTimestampCSV(3661.456, 'seconds')).toBe('3661.456');
        });

        it('should format as HH:MM:SS when format="hms"', () => {
            expect(formatTimestampCSV(0, 'hms')).toBe('00:00:00');
            expect(formatTimestampCSV(1, 'hms')).toBe('00:00:01');
            expect(formatTimestampCSV(65, 'hms')).toBe('00:01:05');
            expect(formatTimestampCSV(3661, 'hms')).toBe('01:01:01');
        });

        it('should format as HH:MM:SS.mmm when format="hms-millis"', () => {
            expect(formatTimestampCSV(0, 'hms-millis')).toBe('00:00:00.000');
            expect(formatTimestampCSV(1.5, 'hms-millis')).toBe('00:00:01.500');
            expect(formatTimestampCSV(65.123, 'hms-millis')).toBe('00:01:05.123');
            expect(formatTimestampCSV(3661.456, 'hms-millis')).toBe('01:01:01.456');
        });

        it('should default to hms-millis when format not specified', () => {
            expect(formatTimestampCSV(1.5)).toBe('00:00:01.500');
        });

        it('should handle edge cases', () => {
            expect(formatTimestampCSV(0.001, 'hms-millis')).toBe('00:00:00.001');
            expect(formatTimestampCSV(359999.999, 'seconds')).toBe('359999.999');
        });
    });

    describe('parseTimestamp', () => {
        it('should parse SRT format timestamps', () => {
            expect(parseTimestamp('00:00:00,000')).toBe(0);
            expect(parseTimestamp('00:00:01,500')).toBe(1.5);
            expect(parseTimestamp('00:01:05,123')).toBe(65.123);
            expect(parseTimestamp('01:01:01,456')).toBe(3661.456);
        });

        it('should parse VTT format timestamps', () => {
            expect(parseTimestamp('00:00:00.000')).toBe(0);
            expect(parseTimestamp('00:00:01.500')).toBe(1.5);
            expect(parseTimestamp('00:01:05.123')).toBe(65.123);
            expect(parseTimestamp('01:01:01.456')).toBe(3661.456);
        });

        it('should parse timestamps without milliseconds', () => {
            expect(parseTimestamp('00:00:01')).toBe(1);
            expect(parseTimestamp('00:01:05')).toBe(65);
            expect(parseTimestamp('01:01:01')).toBe(3661);
        });

        it('should handle long video timestamps', () => {
            expect(parseTimestamp('99:59:59,000')).toBe(359999);
            expect(parseTimestamp('100:00:00,000')).toBe(360000);
        });

        it('should be bidirectional with formatTimestampSRT', () => {
            const testValues = [0, 1.5, 65.123, 3661.456, 359999];
            testValues.forEach(value => {
                const formatted = formatTimestampSRT(value);
                const parsed = parseTimestamp(formatted);
                expect(parsed).toBeCloseTo(value, 3);
            });
        });

        it('should be bidirectional with formatTimestampVTT', () => {
            const testValues = [0, 1.5, 65.123, 3661.456];
            testValues.forEach(value => {
                const formatted = formatTimestampVTT(value);
                const parsed = parseTimestamp(formatted);
                expect(parsed).toBeCloseTo(value, 3);
            });
        });
    });

    describe('formatDuration', () => {
        it('should format sub-second durations', () => {
            expect(formatDuration(0.5)).toBe('0s');
            expect(formatDuration(0.123)).toBe('0s');
        });

        it('should format seconds', () => {
            expect(formatDuration(1)).toBe('1s');
            expect(formatDuration(30.5)).toBe('30s');
            expect(formatDuration(45)).toBe('45s');
        });

        it('should format minutes and seconds', () => {
            expect(formatDuration(60)).toBe('1m');
            expect(formatDuration(65.5)).toBe('1m 5s');
            expect(formatDuration(83)).toBe('1m 23s');
            expect(formatDuration(125)).toBe('2m 5s');
        });

        it('should format hours, minutes, and seconds', () => {
            expect(formatDuration(3600)).toBe('1h');
            expect(formatDuration(3661)).toBe('1h 1m 1s');
            expect(formatDuration(3665)).toBe('1h 1m 5s');
            expect(formatDuration(7384)).toBe('2h 3m 4s');
        });

        it('should handle edge cases', () => {
            expect(formatDuration(0)).toBe('0s');
            expect(formatDuration(0.001)).toBe('0s');
            expect(formatDuration(359999)).toBe('99h 59m 59s');
        });
    });

    describe('calculateDuration', () => {
        it('should calculate duration between two timestamps', () => {
            expect(calculateDuration(0, 1)).toBe(1);
            expect(calculateDuration(1.5, 3.7)).toBe(2.2);
            expect(calculateDuration(0, 60)).toBe(60);
        });

        it('should handle decimal precision', () => {
            expect(calculateDuration(0.5, 2.7)).toBeCloseTo(2.2, 1);
            expect(calculateDuration(1.123, 5.456)).toBeCloseTo(4.333, 3);
        });

        it('should handle long durations', () => {
            expect(calculateDuration(0, 3600)).toBe(3600);
            expect(calculateDuration(100, 3700)).toBe(3600);
        });

        it('should return 0 when start equals end', () => {
            expect(calculateDuration(5, 5)).toBe(0);
        });
    });
});
