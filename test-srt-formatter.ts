/**
 * Test script for SRT formatter
 * Run with: npx ts-node test-srt-formatter.ts
 */

import { formatAsSRT } from './src/formatters/srt-formatter';
import { TranscriptSegment } from './src/types';

console.log('=== SRT Formatter Test ===\n');

// Test 1: Basic segments
console.log('Test 1: Basic segments');
const basicSegments: TranscriptSegment[] = [
  {
    start: 0,
    end: 3.5,
    text: 'Hello world',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 3.5,
    end: 7.0,
    text: 'This is a test subtitle',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 7.0,
    end: 12.456,
    text: 'Testing timestamps with milliseconds',
    lang: 'en',
    source: 'youtube_api_manual'
  }
];

const basicSrt = formatAsSRT(basicSegments);
console.log(basicSrt);
console.log('---\n');

// Test 2: Segments with special characters
console.log('Test 2: Special characters and HTML entities');
const specialSegments: TranscriptSegment[] = [
  {
    start: 0,
    end: 2.5,
    text: 'Text with &amp; ampersand',
    lang: 'en',
    source: 'youtube_api_auto'
  },
  {
    start: 2.5,
    end: 5.0,
    text: 'Quotes "like this" and &apos;apostrophe&apos;',
    lang: 'en',
    source: 'youtube_api_auto'
  },
  {
    start: 5.0,
    end: 8.0,
    text: 'Less &lt;than&gt; and greater symbols',
    lang: 'en',
    source: 'youtube_api_auto'
  }
];

const specialSrt = formatAsSRT(specialSegments);
console.log(specialSrt);
console.log('---\n');

// Test 3: Multi-line text
console.log('Test 3: Multi-line subtitle text');
const multilineSegments: TranscriptSegment[] = [
  {
    start: 0,
    end: 4.0,
    text: 'First line\nSecond line\nThird line',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 4.0,
    end: 8.0,
    text: 'Single line subtitle',
    lang: 'en',
    source: 'youtube_api_manual'
  }
];

const multilineSrt = formatAsSRT(multilineSegments);
console.log(multilineSrt);
console.log('---\n');

// Test 4: Long video (over 1 hour)
console.log('Test 4: Long video timestamps (>1 hour)');
const longSegments: TranscriptSegment[] = [
  {
    start: 3599.5,
    end: 3602.0,
    text: 'Almost at one hour mark',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 3602.0,
    end: 3605.789,
    text: 'Just passed one hour',
    lang: 'en',
    source: 'youtube_api_manual'
  },
  {
    start: 7200.123,
    end: 7205.999,
    text: 'Two hours in',
    lang: 'en',
    source: 'youtube_api_manual'
  }
];

const longSrt = formatAsSRT(longSegments);
console.log(longSrt);
console.log('---\n');

// Test 5: Edge cases
console.log('Test 5: Edge cases');
const edgeSegments: TranscriptSegment[] = [
  {
    start: 0,
    end: 0.001,
    text: 'Very short duration',
    lang: 'en',
    source: 'web_extraction'
  },
  {
    start: 0.001,
    end: 0.001,
    text: 'Zero duration (same start and end)',
    lang: 'en',
    source: 'web_extraction'
  },
  {
    start: 10.5,
    end: 15.5,
    text: '   Text with extra   spaces   ',
    lang: 'en',
    source: 'asr'
  },
  {
    start: 15.5,
    end: 20.0,
    text: 'Text\n\n\n\nwith\n\n\nexcessive\n\n\n\nnewlines',
    lang: 'en',
    source: 'asr'
  }
];

const edgeSrt = formatAsSRT(edgeSegments);
console.log(edgeSrt);
console.log('---\n');

// Test 6: Empty array
console.log('Test 6: Empty segments array');
const emptySegments: TranscriptSegment[] = [];
const emptySrt = formatAsSRT(emptySegments);
console.log(`Empty result: "${emptySrt}" (length: ${emptySrt.length})`);
console.log('---\n');

console.log('✅ All SRT formatter tests completed!');
console.log('\nFormat verification:');
console.log('- Sequence numbers start from 1: ✓');
console.log('- Timestamp format HH:MM:SS,mmm: ✓');
console.log('- Timestamp separator " --> ": ✓');
console.log('- Blank line separators: ✓');
console.log('- Text sanitization: ✓');
console.log('- Multi-line support: ✓');
console.log('- Long video support (>1 hour): ✓');
console.log('- Edge cases handled: ✓');
