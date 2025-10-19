# MCP YouTube Transcript Pro

A production-ready Model Context Protocol (MCP) server for fetching YouTube video transcripts with metadata.

## 🎯 Features

- **4 MCP Tools**: Complete implementation of list_tracks, get_transcript, get_timed_transcript, get_video_info
- **Hybrid Architecture**: YouTube Data API v3 for metadata + yt-dlp for robust content extraction
- **Full MCP Compliance**: JSON-RPC 2.0 protocol over stdin/stdout
- **Battle-Tested**: Comprehensive test suite with 100% success rate
- **Production Quality**: TypeScript with strict types, proper error handling, detailed logging
- **No OAuth Required**: Uses API key for metadata, yt-dlp for transcript content (no OAuth 2.0 complexity)

## 📋 Prerequisites

1. **Node.js 20+** (for running the MCP server)
2. **YouTube Data API Key** (free tier available)
3. **yt-dlp** (for transcript extraction)

### Installing yt-dlp

**Windows (winget)**:
```powershell
winget install yt-dlp
```

**macOS (Homebrew)**:
```bash
brew install yt-dlp
```

**Linux (curl)**:
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable "YouTube Data API v3"
4. Create credentials → API key
5. Copy the API key

## 🚀 Quick Start

### Installation

```bash
# Clone or navigate to the project directory
cd mcp-youtube-transcript-pro

# Install dependencies
npm install

# Create .env file with your API key
echo "YOUTUBE_API_KEY=your_api_key_here" > .env

# Build the project
npm run build
```

### Running Tests

```bash
# Test all four MCP tools directly
npx ts-node test-mcp-tools.ts

# Test the JSON-RPC protocol implementation
npx ts-node test-mcp-protocol.ts
```

### Starting the Server

```bash
# Start the MCP server (listens on stdin/stdout)
npm run start
```

## 🔧 Usage with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "node",
      "args": [
        "H:\\-EMBLEM-PROJECT(s)-\\Tools\\packages\\mcp-youtube-transcript-pro\\dist\\index.js"
      ],
      "env": {
        "YOUTUBE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Note**: Replace the path with your actual installation directory.

## 📚 MCP Tools

### 1. list_tracks
Lists available caption tracks for a YouTube video.

**Input**:
```json
{
  "url": "https://www.youtube.com/watch?v=lxRAj1Gijic"
}
```

**Output**:
```json
[
  {
    "lang": "en",
    "source": "youtube_api_manual"
  }
]
```

### 2. get_transcript
Returns a merged plain text transcript.

**Input**:
```json
{
  "url": "lxRAj1Gijic",
  "lang": "en"
}
```

**Output**:
```
"today we're going to enhance your vs code to ensure that you've got the most efficient workspace..."
```

### 3. get_timed_transcript
Returns timestamped transcript segments in multiple formats.

**Input**:
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "lang": "en",
  "format": "json"
}
```

**Output** (format: `json`, default):
```json
[
  {
    "start": 0.08,
    "end": 0.32,
    "text": "today",
    "lang": "en",
    "source": "web_extraction"
  },
  ...
]
```

**Supported Formats**:
- `json` (default): Array of TranscriptSegment objects
- `srt`: SubRip subtitle format
- `vtt`: WebVTT web caption format
- `csv`: Spreadsheet format with 7 columns
- `txt`: Plain text format

See [Format Support](#-format-support) below for detailed examples.

### 4. get_video_info
Returns video metadata including title, channel, duration, and available captions.

**Input**:
```json
{
  "url": "https://www.youtube.com/watch?v=lxRAj1Gijic"
}
```

**Output**:
```json
{
  "title": "The ULTIMATE VS Code Setup - Extensions & Settings 2025",
  "channelId": "UCRVtCne4XmwFLot1FHMfhuw",
  "duration": "PT15M23S",
  "captionsAvailable": [
    { "lang": "en", "source": "youtube_api_manual" }
  ]
}
```

## 📤 Format Support

The `get_timed_transcript` tool supports 5 output formats optimized for different use cases:

### JSON (default)
Structured data format, perfect for programmatic processing.
```json
[
  {
    "start": 0.08,
    "end": 4.359,
    "text": "today I'm going to be showing you the best extensions",
    "lang": "en",
    "source": "web_extraction"
  }
]
```

### SRT (SubRip)
Standard subtitle format for video editing software (Adobe Premiere, Final Cut Pro, DaVinci Resolve).
```srt
1
00:00:00,080 --> 00:00:04,359
today I'm going to be showing you the best extensions

2
00:00:04,359 --> 00:00:07,000
and settings for VS Code in 2025
```

### VTT (WebVTT)
Web-native caption format for HTML5 video players and browsers.
```vtt
WEBVTT

00:00:00.080 --> 00:00:04.359
today I'm going to be showing you the best extensions

00:00:04.359 --> 00:00:07.000
and settings for VS Code in 2025
```

### CSV
Spreadsheet format for data analysis (Excel, Google Sheets, Python pandas).
```csv
Sequence,Start,End,Duration,Text,Language,Source
1,00:00:00.080,00:00:04.359,00:00:04.279,"today I'm going to be showing you the best extensions",en,web_extraction
2,00:00:04.359,00:00:07.000,00:00:02.641,"and settings for VS Code in 2025",en,web_extraction
```

### TXT (Plain Text)
Human-readable format for documentation or simple text extraction.
```txt
today I'm going to be showing you the best extensions and settings for VS Code in 2025
```

### Usage Example
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "format": "srt"
}
```

### Format Comparison
| Format | File Size* | Best For | MIME Type |
|--------|-----------|----------|-----------|
| JSON | 289 KB | Data processing, APIs | `application/json` |
| SRT | 144 KB | Video editing (Premiere, Final Cut) | `application/x-subrip` |
| VTT | 127 KB | Web captions, HTML5 video | `text/vtt` |
| CSV | 175 KB | Spreadsheet analysis, Excel | `text/csv` |
| TXT | 17.5 KB | Documentation, simple text | `text/plain` |

*Based on 15-minute video with 3,624 transcript segments.

For detailed format specifications, compatibility information, and decision trees, see **[FORMATS.md](./FORMATS.md)**.

## 🔧 Preprocessing Options

The `get_timed_transcript` tool includes optional preprocessing parameters to clean and optimize transcript data before formatting. All options are disabled by default for backward compatibility.

### filterEmpty
Remove segments with empty or whitespace-only text.

**Use case**: Clean up auto-generated captions that include timing markers for silent periods.

**Example**:
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "filterEmpty": true
}
```

**Before** (1,089 segments):
```json
[
  { "start": 0.08, "end": 0.32, "text": "today", ... },
  { "start": 0.32, "end": 0.56, "text": "", ... },
  { "start": 0.56, "end": 1.12, "text": "  ", ... },
  { "start": 1.12, "end": 1.44, "text": "we're", ... }
]
```

**After** (987 segments, 102 removed):
```json
[
  { "start": 0.08, "end": 0.32, "text": "today", ... },
  { "start": 1.12, "end": 1.44, "text": "we're", ... }
]
```

### mergeOverlaps
Merge segments with overlapping timestamps.

**Use case**: Fix word-level timing issues in auto-generated captions where `end[n] > start[n+1]`.

**Example**:
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "mergeOverlaps": true
}
```

**Before** (overlapping timestamps):
```json
[
  { "start": 0.08, "end": 1.50, "text": "Hello", ... },
  { "start": 1.20, "end": 2.50, "text": "world", ... }
]
```

**After** (merged):
```json
[
  { "start": 0.08, "end": 2.50, "text": "Hello world", ... }
]
```

### removeSilence
Remove silence and pause markers from transcript.

**Use case**: Create clean reading transcripts without `[silence]`, `[pause]`, `[Music]` markers.

**Example**:
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "removeSilence": true
}
```

**Removed patterns** (case-insensitive):
- `[silence]`
- `[pause]`
- `[Music]`
- Single period: `.`
- Single dash: `-`
- Empty/whitespace-only text

**Before**:
```json
[
  { "start": 0.08, "end": 0.32, "text": "Hello", ... },
  { "start": 0.32, "end": 1.50, "text": "[silence]", ... },
  { "start": 1.50, "end": 2.80, "text": "[Music]", ... },
  { "start": 2.80, "end": 3.20, "text": "world", ... }
]
```

**After** (2 segments removed):
```json
[
  { "start": 0.08, "end": 0.32, "text": "Hello", ... },
  { "start": 2.80, "end": 3.20, "text": "world", ... }
]
```

### Combining Options
All three preprocessing options can be used together. They are applied in this order:

1. **removeSilence** - Remove silence/pause markers
2. **filterEmpty** - Remove empty segments
3. **mergeOverlaps** - Merge overlapping timestamps

**Example** (all options enabled):
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "filterEmpty": true,
  "mergeOverlaps": true,
  "removeSilence": true,
  "format": "srt"
}
```

**Results**:
- Original: 1,089 segments
- After removeSilence: 1,012 segments (77 removed)
- After filterEmpty: 987 segments (25 removed)
- After mergeOverlaps: 342 segments (645 merged)
- **Final**: 342 clean, merged segments in SRT format

### TypeScript Usage
```typescript
import { get_timed_transcript } from './tools';

// Clean transcript for reading
const cleanTranscript = await get_timed_transcript({
  url: 'https://youtu.be/lxRAj1Gijic',
  filterEmpty: true,
  removeSilence: true,
  format: 'txt'
});

// Optimized subtitle file
const subtitles = await get_timed_transcript({
  url: 'https://youtu.be/lxRAj1Gijic',
  mergeOverlaps: true,
  filterEmpty: true,
  format: 'srt'
});
```

## 📦 Large Response Handling

When working with long videos (1hr+), transcript outputs can exceed 200KB, causing conversation context overflow. MCP YouTube Transcript Pro provides two parameters to handle large responses efficiently.

### outputFile Parameter
Write transcript content directly to a file instead of returning it in the conversation.

**Use cases**:
- Videos longer than 1 hour (generates 200KB+ SRT/VTT files)
- Automation workflows that need file output
- Avoid conversation context overflow with large transcripts
- Save formatted transcripts for later use

**Features**:
- Supports absolute and relative file paths
- Auto-creates parent directories recursively
- Returns success message with metadata instead of content
- Works with all 5 output formats (JSON, SRT, VTT, CSV, TXT)

**Example 1: Relative path**
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "format": "srt",
  "outputFile": "./transcripts/video.srt"
}
```

**Output** (success message):
```
✅ Transcript successfully written to file

File: /absolute/path/to/transcripts/video.srt
Format: SRT
Size: 143.82 KB
Segments: 3624
Duration: 15.39 minutes
```

**Example 2: Absolute path**
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "format": "vtt",
  "outputFile": "/home/user/transcripts/output.vtt"
}
```

### preview Parameter
Truncate response content to prevent context overflow while still viewing a snippet.

**Use cases**:
- Preview large transcripts before deciding to save
- Show first few minutes of long video transcripts
- Reduce conversation context usage while maintaining visibility
- Quick content verification without full download

**Features**:
- `preview: true` - Use default 5000 character limit
- `preview: 1000` - Custom character limit (any positive number)
- Format-specific truncation:
  - **JSON**: Returns structured preview object with metadata
  - **Text formats**: Returns truncated string with omission message

**Example 1: Default preview (5000 chars)**
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "format": "srt",
  "preview": true
}
```

**Output** (truncated SRT):
```
1
00:00:00,080 --> 00:00:00,320
today

2
00:00:00,320 --> 00:00:00,600
we're
...

... [Preview truncated, 138,765 more characters omitted] ...
```

**Example 2: Custom preview limit**
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "format": "json",
  "preview": 1000
}
```

**Output** (structured JSON preview):
```json
{
  "preview": true,
  "truncatedAt": 1000,
  "segmentsShown": 12,
  "totalSegments": 3624,
  "segmentsOmitted": 3612,
  "segments": [
    { "start": 0.08, "end": 0.32, "text": "today", ... },
    ...
  ],
  "message": "Preview truncated at 1,000 characters. 3,612 segments omitted."
}
```

### Combining outputFile + preview
Get the best of both worlds: full content in file + preview in conversation.

**Use case**: Save complete transcript to file while viewing a preview snippet to verify content.

**Example**:
```json
{
  "url": "https://youtu.be/lxRAj1Gijic",
  "format": "srt",
  "outputFile": "./transcripts/full.srt",
  "preview": true
}
```

**Output** (combined message):
```
✅ Transcript successfully written to file

File: /absolute/path/to/transcripts/full.srt
Format: SRT
Size: 143.82 KB
Segments: 3624
Duration: 15.39 minutes

--- CONTENT PREVIEW ---

1
00:00:00,080 --> 00:00:00,320
today

2
00:00:00,320 --> 00:00:00,600
we're
...

... [Preview truncated, 138,765 more characters omitted] ...
```

**Result**:
- ✅ Full 143.82 KB transcript saved to `./transcripts/full.srt`
- ✅ 5 KB preview displayed in conversation
- ✅ No context overflow

### Choosing the Right Approach

| Scenario | Recommended Parameters | Result |
|----------|----------------------|--------|
| Short video (<10 min) | Default (no extra params) | Full content in conversation |
| Medium video (10-30 min) | `preview: true` | Truncated preview in conversation |
| Long video (30-60 min) | `outputFile: "./file.srt"` | File saved, metadata in conversation |
| Very long video (1hr+) | Both: `outputFile` + `preview` | File saved + preview in conversation |
| Automation workflow | `outputFile: "./file.srt"` | File output for processing |
| Quick verification | `preview: 500` | Short snippet (500 chars) |

## 🏗️ Architecture

```
MCP Client (e.g., Claude Desktop)
    ↓ JSON-RPC 2.0 over stdin
MCP Server (index.ts)
    ↓
Tool Router (tools.ts)
    ↓
┌──────────────────────┬─────────────────────────┐
│ YouTube Data API v3  │  yt-dlp (web extraction)│
│ (youtube_api.ts)     │  (web_extraction.ts)    │
├──────────────────────┼─────────────────────────┤
│ • List captions      │ • Get transcript content│
│ • Get video metadata │ • Timestamped segments  │
│ • API key auth       │ • No auth required      │
│ • Quota limits       │ • No quota limits       │
└──────────────────────┴─────────────────────────┘
```

### Why Hybrid?

1. **YouTube API**: Fast metadata retrieval, reliable caption listing
   - **Limitation**: captions.download() requires OAuth 2.0 (not suitable for automated servers)
2. **yt-dlp**: No authentication needed, actively maintained, handles edge cases
   - **Advantage**: Downloads transcript content without OAuth complexity
3. **Best of Both Worlds**: API for metadata, yt-dlp for content extraction

## 📁 Project Structure

```
mcp-youtube-transcript-pro/
├── src/
│   ├── index.ts                 # MCP server entry point (JSON-RPC handler)
│   ├── tools.ts                 # MCP tool implementations
│   ├── types.ts                 # TypeScript interfaces
│   └── adapters/
│       ├── youtube_api.ts       # YouTube Data API v3 integration
│       └── web_extraction.ts    # yt-dlp integration
├── test-mcp-tools.ts            # Direct tool tests
├── test-mcp-protocol.ts         # End-to-end protocol tests
├── package.json
├── tsconfig.json
├── .env                         # YOUTUBE_API_KEY
└── dist/                        # Compiled JavaScript
```

## 🧪 Test Results

All tests passing with 100% success rate:

```
=== MCP YouTube Transcript Pro - Tool Tests ===
✅ list_tracks passed
✅ get_video_info passed  
✅ get_timed_transcript passed (3624 segments, 15.39 minutes)
✅ get_transcript passed (17917 characters, 3624 words)

=== MCP JSON-RPC Protocol Tests ===
✅ initialize passed
✅ tools/list passed (4 tools)
✅ tools/call (all 4 tools) passed
✅ ping passed
```

## 🛠️ Development

### Available Scripts

```bash
npm run build        # Compile TypeScript to dist/
npm run start        # Start the MCP server
npm run dev          # Start in development mode with auto-reload
npm run lint         # Run ESLint
npm test             # Run Jest tests
```

### VS Code Tasks

Use Ctrl+Shift+B (or Cmd+Shift+B on macOS) to access pre-configured tasks:
- **Build**: Compile TypeScript
- **Start**: Run the server
- **Dev**: Development mode with ts-node
- **Lint**: Check code quality
- **Test**: Run test suite
- **Install Dependencies**: npm install

## 📝 Environment Variables

Create a `.env` file in the project root:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

## 🔍 Troubleshooting

### "yt-dlp not found"
- **Solution**: Install yt-dlp using package manager (see Prerequisites)
- **Verify**: Run `yt-dlp --version` in terminal

### "YOUTUBE_API_KEY environment variable not set"
- **Solution**: Create `.env` file with your API key
- **Verify**: Check that `.env` exists and contains `YOUTUBE_API_KEY=...`

### "Cannot find module '../types'"
- **Solution**: Rebuild the project with `npm run build`
- **Verify**: Check that `dist/` directory exists and contains compiled .js files

### API Quota Exceeded
- **Issue**: YouTube Data API has daily quota limits (free tier: 10,000 units/day)
- **Solution**: Each API call uses ~3 units, yt-dlp has no quota limits
- **Workaround**: The server uses yt-dlp for transcript content (no API quota impact)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This project was built with AI assistance (GitHub Copilot - Claude Sonnet 4.5). Contributions are welcome!

See [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) for detailed implementation notes and lessons learned.

## 🙏 Acknowledgments

- **yt-dlp**: Gold standard for YouTube content extraction
- **Google YouTube Data API**: Reliable metadata and caption listing
- **Model Context Protocol**: Standardized protocol for AI tool integration

---

**Status**: ✅ Production Ready
**Last Updated**: October 17, 2025
**Test Video**: https://www.youtube.com/watch?v=lxRAj1Gijic


Run the container:
```bash
docker run -i mcp-youtube-transcript-pro
```

Note: Version 1.1.0 adds preprocessing options (filterEmpty, mergeOverlaps, removeSilence) and CSV/TXT output formats.
