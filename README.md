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
Returns an array of timestamped transcript segments.

**Input**:
```json
{
  "url": "https://youtu.be/lxRAj1Gijic"
}
```

**Output**:
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
**Last Updated**: October 14, 2025
**Test Video**: https://www.youtube.com/watch?v=lxRAj1Gijic


Run the container:
```bash
docker run -i mcp-youtube-transcript-pro
```
