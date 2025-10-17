/**
 * Quick test script for timestamp utilities
 * Run: npx ts-node test-timestamp-utils.ts
 */

import { formatTimestampSRT, formatTimestampVTT, formatTimestampCSV, parseTimestamp, formatDuration } from './src/formatters/timestamp-utils';

console.log('=== Timestamp Utility Tests ===\n');

// Test SRT format (comma separator)
console.log('SRT Format (comma separator):');
console.log(`  83.456s → ${formatTimestampSRT(83.456)}`); // Expected: 00:01:23,456
console.log(`  3661.789s → ${formatTimestampSRT(3661.789)}`); // Expected: 01:01:01,789
console.log(`  0.001s → ${formatTimestampSRT(0.001)}`); // Expected: 00:00:00,001
console.log(`  7200.5s → ${formatTimestampSRT(7200.5)}`); // Expected: 02:00:00,500

// Test VTT format (period separator)
console.log('\nVTT Format (period separator):');
console.log(`  83.456s → ${formatTimestampVTT(83.456)}`); // Expected: 00:01:23.456
console.log(`  3661.789s → ${formatTimestampVTT(3661.789)}`); // Expected: 01:01:01.789
console.log(`  0.001s → ${formatTimestampVTT(0.001)}`); // Expected: 00:00:00.001

// Test CSV formats
console.log('\nCSV Formats:');
console.log(`  83.456s (seconds) → ${formatTimestampCSV(83.456, 'seconds')}`); // Expected: 83.456
console.log(`  83.456s (hms) → ${formatTimestampCSV(83.456, 'hms')}`); // Expected: 00:01:23
console.log(`  83.456s (hms-millis) → ${formatTimestampCSV(83.456, 'hms-millis')}`); // Expected: 00:01:23.456

// Test parsing
console.log('\nParsing timestamps:');
try {
    const parsed1 = parseTimestamp('00:01:23.456');
    console.log(`  "00:01:23.456" → ${parsed1}s`); // Expected: 83.456
    
    const parsed2 = parseTimestamp('01:01:01,789');
    console.log(`  "01:01:01,789" → ${parsed2}s`); // Expected: 3661.789
} catch (error) {
    console.error(`  Parse error: ${error}`);
}

// Test duration formatting
console.log('\nDuration formatting:');
console.log(`  83s → ${formatDuration(83)}`); // Expected: 1m 23s
console.log(`  3661s → ${formatDuration(3661)}`); // Expected: 1h 1m 1s
console.log(`  45s → ${formatDuration(45)}`); // Expected: 45s
console.log(`  7200s → ${formatDuration(7200)}`); // Expected: 2h

// Test edge cases
console.log('\nEdge cases:');
console.log(`  0s (SRT) → ${formatTimestampSRT(0)}`); // Expected: 00:00:00,000
console.log(`  -5s (VTT, should warn) → ${formatTimestampVTT(-5)}`); // Expected: 00:00:00.000
console.log(`  359999s (99h 59m 59s) → ${formatTimestampSRT(359999)}`); // Expected: 99:59:59,000

console.log('\n✅ All tests completed!');
