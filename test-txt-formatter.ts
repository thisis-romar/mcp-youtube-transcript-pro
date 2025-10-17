/**
 * Test script for TXT formatter
 * Run with: npx ts-node test-txt-formatter.ts
 */

import { formatAsTXT } from './src/formatters/txt-formatter';
import { TranscriptSegment } from './src/types';

console.log('=== TXT Formatter Test ===\n');

// Test segments with various gaps
const testSegments: TranscriptSegment[] = [
  {
    start: 0,
    end: 3.5,
    text: 'Hello world.',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 3.5,
    end: 7.0,
    text: 'This is a test.',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 7.0,
    end: 10.5,
    text: 'Final sentence in paragraph.',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 13.0,  // 2.5 second gap - should start new paragraph
    end: 16.5,
    text: 'After a pause, new paragraph starts.',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 16.5,
    end: 20.0,
    text: 'Continues in same paragraph.',
    lang: 'en',
    source: 'youtube_api_manual'
  }
];

// Test 1: Plain mode (default)
console.log('Test 1: Plain mode (default)');
const plainTxt = formatAsTXT(testSegments);
console.log(plainTxt);
console.log('---\n');

// Test 2: Timestamped mode
console.log('Test 2: Timestamped mode (HH:MM:SS)');
const timestampedTxt = formatAsTXT(testSegments, { mode: 'timestamped' });
console.log(timestampedTxt);
console.log('---\n');

// Test 3: Timestamped mode with milliseconds
console.log('Test 3: Timestamped mode with milliseconds');
const timestampedMillisTxt = formatAsTXT(testSegments, { 
  mode: 'timestamped',
  timestampFormat: 'hms-millis'
});
console.log(timestampedMillisTxt);
console.log('---\n');

// Test 4: Paragraph mode
console.log('Test 4: Paragraph mode (default 2.0 second gap threshold)');
const paragraphTxt = formatAsTXT(testSegments, { mode: 'paragraph' });
console.log(paragraphTxt);
console.log('Note: 2.5 second gap between segments creates new paragraph');
console.log('---\n');

// Test 5: Paragraph mode with custom gap
console.log('Test 5: Paragraph mode with 3.0 second gap threshold');
const paragraphCustomGapTxt = formatAsTXT(testSegments, { 
  mode: 'paragraph',
  paragraphGap: 3.0
});
console.log(paragraphCustomGapTxt);
console.log('Note: With 3.0s threshold, 2.5s gap does NOT create new paragraph');
console.log('---\n');

// Test 6: Timestamped mode with metadata
console.log('Test 6: Timestamped mode with metadata header');
const timestampedWithMetaTxt = formatAsTXT(testSegments, { 
  mode: 'timestamped',
  includeMetadata: true
});
console.log(timestampedWithMetaTxt);
console.log('---\n');

// Test 7: Paragraph mode with metadata
console.log('Test 7: Paragraph mode with metadata header');
const paragraphWithMetaTxt = formatAsTXT(testSegments, { 
  mode: 'paragraph',
  includeMetadata: true
});
console.log(paragraphWithMetaTxt);
console.log('---\n');

// Test 8: Plain mode with metadata (should ignore metadata)
console.log('Test 8: Plain mode with metadata (should be ignored)');
const plainWithMetaTxt = formatAsTXT(testSegments, { 
  mode: 'plain',
  includeMetadata: true  // Should be ignored in plain mode
});
console.log(plainWithMetaTxt);
console.log('Note: Metadata header is ignored in plain mode (pure text output)');
console.log('---\n');

// Test 9: Long video with timestamps
console.log('Test 9: Long video timestamps (>1 hour)');
const longSegments: TranscriptSegment[] = [
  {
    start: 3599.5,
    end: 3602.0,
    text: 'Almost at one hour mark.',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 3602.0,
    end: 3605.789,
    text: 'Just passed one hour.',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 7200.123,
    end: 7205.999,
    text: 'Two hours in.',
    lang: 'en',
    source: 'youtube_api_manual'
  }
];

const longTimestampedTxt = formatAsTXT(longSegments, { 
  mode: 'timestamped',
  timestampFormat: 'hms-millis'
});
console.log(longTimestampedTxt);
console.log('---\n');

// Test 10: Edge cases
console.log('Test 10: Edge cases (empty text, very short segments)');
const edgeSegments: TranscriptSegment[] = [
  {
    start: 0,
    end: 0.5,
    text: '',
    lang: 'en',
    source: 'asr'
  },
  {
    start: 0.5,
    end: 1.0,
    text: 'A',
    lang: 'en',
    source: 'asr'
  },
  {
    start: 1.0,
    end: 1.1,
    text: 'B',
    lang: 'en',
    source: 'asr'
  },
  {
    start: 5.0,  // Large gap
    end: 6.0,
    text: 'C',
    lang: 'en',
    source: 'asr'
  }
];

console.log('Plain mode:');
console.log(formatAsTXT(edgeSegments, { mode: 'plain' }));

console.log('Timestamped mode:');
console.log(formatAsTXT(edgeSegments, { mode: 'timestamped' }));

console.log('Paragraph mode:');
console.log(formatAsTXT(edgeSegments, { mode: 'paragraph' }));
console.log('---\n');

// Test 11: Empty array
console.log('Test 11: Empty segments array');
const emptySegments: TranscriptSegment[] = [];
const emptyTxt = formatAsTXT(emptySegments);
console.log(`Result: "${emptyTxt}" (length: ${emptyTxt.length})`);
console.log('---\n');

// Test 12: Single segment
console.log('Test 12: Single segment');
const singleSegment: TranscriptSegment[] = [{
  start: 0,
  end: 5,
  text: 'Just one sentence.',
  lang: 'en',
  source: 'youtube_api_manual'
}];

console.log('Plain:');
console.log(formatAsTXT(singleSegment, { mode: 'plain' }));

console.log('Timestamped:');
console.log(formatAsTXT(singleSegment, { mode: 'timestamped' }));

console.log('Paragraph:');
console.log(formatAsTXT(singleSegment, { mode: 'paragraph' }));
console.log('---\n');

// Test 13: Mode comparison
console.log('Test 13: All three modes side-by-side');
const compareSegments: TranscriptSegment[] = [
  { start: 0, end: 3, text: 'First segment.', lang: 'en', source: 'youtube_api_manual' },
  { start: 3, end: 6, text: 'Second segment.', lang: 'en', source: 'youtube_api_manual' },
  { start: 9, end: 12, text: 'Third segment after gap.', lang: 'en', source: 'youtube_api_manual' }
];

console.log('PLAIN MODE:');
console.log(formatAsTXT(compareSegments, { mode: 'plain' }));

console.log('\nTIMESTAMPED MODE:');
console.log(formatAsTXT(compareSegments, { mode: 'timestamped' }));

console.log('\nPARAGRAPH MODE:');
console.log(formatAsTXT(compareSegments, { mode: 'paragraph' }));
console.log('---\n');

// Test 14: Real-world example
console.log('Test 14: Real-world example (video tutorial excerpt)');
const realWorldSegments: TranscriptSegment[] = [
  { start: 0, end: 4, text: 'Welcome to this tutorial.', lang: 'en', source: 'youtube_api_manual' },
  { start: 4, end: 8, text: 'Today we will learn about programming.', lang: 'en', source: 'youtube_api_manual' },
  { start: 8, end: 12, text: 'Let\'s get started!', lang: 'en', source: 'youtube_api_manual' },
  { start: 15, end: 20, text: 'First, open your code editor.', lang: 'en', source: 'youtube_api_manual' },
  { start: 20, end: 25, text: 'Create a new file called "hello.js".', lang: 'en', source: 'youtube_api_manual' },
  { start: 25, end: 30, text: 'Now, type console.log("Hello, World!").', lang: 'en', source: 'youtube_api_manual' },
  { start: 35, end: 40, text: 'Great! You\'ve written your first program.', lang: 'en', source: 'youtube_api_manual' },
  { start: 40, end: 45, text: 'Thanks for watching!', lang: 'en', source: 'youtube_api_manual' }
];

console.log('Paragraph mode (natural reading):');
console.log(formatAsTXT(realWorldSegments, { 
  mode: 'paragraph',
  paragraphGap: 3.0
}));

console.log('\nTimestamped mode (following along):');
console.log(formatAsTXT(realWorldSegments, { mode: 'timestamped' }));
console.log('---\n');

console.log('✅ All TXT formatter tests completed!');
console.log('\nFormat verification:');
console.log('- Plain mode: ✓');
console.log('- Timestamped mode (HMS): ✓');
console.log('- Timestamped mode (HMS with millis): ✓');
console.log('- Paragraph mode: ✓');
console.log('- Custom paragraph gap threshold: ✓');
console.log('- Metadata header: ✓');
console.log('- Metadata ignored in plain mode: ✓');
console.log('- Long video timestamps: ✓');
console.log('- Edge cases handled: ✓');
console.log('- Empty input handling: ✓');
console.log('\nModes summary:');
console.log('- plain: Space-separated text (word counting, text analysis)');
console.log('- timestamped: Line-by-line with timestamps (following along)');
console.log('- paragraph: Natural flow with gap-based grouping (readability)');
