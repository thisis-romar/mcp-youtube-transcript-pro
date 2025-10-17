# Quick Start Guide - MCP YouTube Transcript Pro

**Get up and running in 5 minutes!**

## Prerequisites

Before starting, ensure you have:
- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] yt-dlp installed (see below)
- [ ] YouTube Data API key (see below)

## Step 1: Install yt-dlp

### Windows (PowerShell)
```powershell
winget install yt-dlp
```

### macOS
```bash
brew install yt-dlp
```

### Linux
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**Verify installation:**
```bash
yt-dlp --version
```

## Step 2: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Click "Enable APIs and Services"
4. Search for "YouTube Data API v3"
5. Click "Enable"
6. Go to "Credentials" → "Create Credentials" → "API key"
7. Copy the API key

**Free Tier**: 10,000 quota units/day (sufficient for most use cases)

## Step 3: Set Up Project

```bash
# Navigate to project directory
cd h:\-EMBLEM-PROJECT(s)-\Tools\packages\mcp-youtube-transcript-pro

# Install dependencies (484 packages)
npm install

# Create .env file with your API key
echo "YOUTUBE_API_KEY=your_api_key_here" > .env

# Build the project
npm run build
```

## Step 4: Test the Server

Run the comprehensive tests to verify everything works:

```bash
# Test all 4 MCP tools
npx ts-node test-mcp-tools.ts
```

**Expected output:**
```
=== MCP YouTube Transcript Pro - Tool Tests ===

✅ list_tracks passed
✅ get_video_info passed
✅ get_timed_transcript passed (3624 segments)
✅ get_transcript passed (17917 characters)

==================================================
✅ All tests passed successfully!
==================================================
```

**Optional**: Test the JSON-RPC protocol:
```bash
npx ts-node test-mcp-protocol.ts
```

## Step 5: Deploy to Claude Desktop

### 5a. Locate Claude Desktop Config

**Windows:**
```
C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 5b. Add MCP Server Configuration

Edit `claude_desktop_config.json` and add:

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

**Important**: 
- Replace the path with your actual installation directory
- Replace `your_api_key_here` with your actual API key
- Use double backslashes (`\\`) on Windows paths

### 5c. Restart Claude Desktop

1. **Completely quit** Claude Desktop (not just close the window)
   - Windows: Right-click taskbar icon → Quit
   - macOS: Claude Desktop → Quit Claude Desktop
2. **Restart** Claude Desktop
3. **Verify**: Type `@` in a chat and look for "youtube-transcript" in the tools list

## Step 6: Use the Tools

### Example 1: Get Video Info

In Claude Desktop:
```
@youtube-transcript get_video_info
URL: https://www.youtube.com/watch?v=lxRAj1Gijic
```

**Output:**
```json
{
  "title": "The ULTIMATE VS Code Setup - Extensions & Settings 2025",
  "channelId": "UCRVtCne4XmwFLot1FHMfhuw",
  "duration": "PT15M23S",
  "captionsAvailable": [...]
}
```

### Example 2: Get Transcript

In Claude Desktop:
```
@youtube-transcript get_transcript
URL: lxRAj1Gijic
Language: en
```

**Output:**
Plain text transcript (17,917 characters)

### Example 3: Get Timed Transcript (JSON)

In Claude Desktop:
```
@youtube-transcript get_timed_transcript
URL: https://youtu.be/lxRAj1Gijic
Format: json
```

**Output:**
Array of 3,624 timestamped segments

### Example 4: List Captions

In Claude Desktop:
```
@youtube-transcript list_tracks
URL: https://www.youtube.com/watch?v=lxRAj1Gijic
```

**Output:**
```json
[
  {
    "lang": "en",
    "source": "youtube_api_manual"
  }
]
```

## 📤 Choosing Output Formats

The `get_timed_transcript` tool supports 5 formats optimized for different workflows:

### Format Examples

#### 1. SRT (SubRip) - Video Editing
Perfect for Adobe Premiere, Final Cut Pro, DaVinci Resolve, or any video editor.

```
@youtube-transcript get_timed_transcript
URL: https://youtu.be/lxRAj1Gijic
Format: srt
```

**Output:**
```srt
1
00:00:00,080 --> 00:00:04,359
today I'm going to be showing you the best extensions

2
00:00:04,359 --> 00:00:07,000
and settings for VS Code in 2025
```

**Use Case**: Import directly into video editor timeline for subtitles.

#### 2. VTT (WebVTT) - Web Captions
Standard format for HTML5 `<video>` elements and browsers.

```
@youtube-transcript get_timed_transcript
URL: https://youtu.be/lxRAj1Gijic
Format: vtt
```

**Output:**
```vtt
WEBVTT

00:00:00.080 --> 00:00:04.359
today I'm going to be showing you the best extensions

00:00:04.359 --> 00:00:07.000
and settings for VS Code in 2025
```

**Use Case**: Add captions to website videos, streaming platforms, accessibility features.

#### 3. CSV - Data Analysis
Spreadsheet format for Excel, Google Sheets, Python pandas, or R.

```
@youtube-transcript get_timed_transcript
URL: https://youtu.be/lxRAj1Gijic
Format: csv
```

**Output:**
```csv
Sequence,Start,End,Duration,Text,Language,Source
1,00:00:00.080,00:00:04.359,00:00:04.279,"today I'm going to be showing you the best extensions",en,web_extraction
2,00:00:04.359,00:00:07.000,00:00:02.641,"and settings for VS Code in 2025",en,web_extraction
```

**Use Case**: Analyze timing patterns, search keywords, generate reports, sentiment analysis.

#### 4. TXT - Plain Text
Simple text extraction for documentation or reading.

```
@youtube-transcript get_timed_transcript
URL: https://youtu.be/lxRAj1Gijic
Format: txt
```

**Output:**
```txt
today I'm going to be showing you the best extensions and settings for VS Code in 2025
```

**Use Case**: Documentation, summaries, text search, minimal file size (94% smaller than JSON!).

#### 5. JSON - Programmatic Access
Structured data for APIs, applications, or custom processing.

```
@youtube-transcript get_timed_transcript
URL: https://youtu.be/lxRAj1Gijic
Format: json
```

**Output:**
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

**Use Case**: Build applications, integrate with APIs, custom data processing.

### Quick Format Selection Guide

| I Need To... | Use Format |
|--------------|------------|
| Add subtitles to my video | `srt` |
| Embed captions on a website | `vtt` |
| Analyze data in Excel/Python | `csv` |
| Extract text only | `txt` |
| Build an application | `json` |

### Real-World File Sizes
Based on a 15-minute video with 3,624 transcript segments:

| Format | File Size | Savings |
|--------|-----------|---------|
| JSON | 289 KB | baseline |
| SRT | 144 KB | 50% smaller |
| VTT | 127 KB | 56% smaller |
| CSV | 175 KB | 40% smaller |
| **TXT** | **17.5 KB** | **94% smaller!** |

For detailed format specifications and compatibility information, see **[FORMATS.md](./FORMATS.md)**.

## Supported URL Formats

All tools accept multiple YouTube URL formats:

- ✅ `https://www.youtube.com/watch?v=lxRAj1Gijic`
- ✅ `https://youtu.be/lxRAj1Gijic`
- ✅ `https://www.youtube.com/embed/lxRAj1Gijic`
- ✅ `https://www.youtube.com/shorts/lxRAj1Gijic`
- ✅ `lxRAj1Gijic` (bare video ID)

## Troubleshooting

### yt-dlp not found
**Symptom**: Error "yt-dlp not found in PATH"

**Solution**:
1. Verify installation: `yt-dlp --version`
2. If not installed, follow Step 1 above
3. If installed but not in PATH, restart your terminal

### API key not working
**Symptom**: Error "YOUTUBE_API_KEY environment variable not set"

**Solution**:
1. Check `.env` file exists in project root
2. Verify it contains: `YOUTUBE_API_KEY=your_key_here`
3. Rebuild project: `npm run build`
4. Restart Claude Desktop

### "Method not found" in Claude Desktop
**Symptom**: Claude Desktop doesn't recognize tools

**Solution**:
1. Verify config file path is correct
2. Check for JSON syntax errors in `claude_desktop_config.json`
3. Completely quit and restart Claude Desktop (not just reload)
4. Check Claude Desktop logs for errors

### Quota exceeded
**Symptom**: API calls fail after many requests

**Solution**:
- YouTube Data API free tier: 10,000 units/day
- Each `list_tracks` call: ~3 units
- Each `get_video_info` call: ~3 units
- Transcript extraction (yt-dlp): **0 units** (no API quota impact)
- Wait 24 hours for quota reset or upgrade to paid tier

## Next Steps

1. ✅ Complete Quick Start (you are here)
2. 📚 Read [README.md](./README.md) for detailed documentation
3. 🔬 Explore [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) for technical details
4. 🎯 Try different YouTube videos
5. 🚀 Integrate into your workflows

## Need Help?

- **Documentation**: See [README.md](./README.md)
- **Implementation**: See [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- **Tests**: Run `npx ts-node test-mcp-tools.ts`

## Success Checklist

After completing this guide, you should have:
- [x] yt-dlp installed and working
- [x] YouTube Data API key obtained
- [x] Project dependencies installed
- [x] .env file configured
- [x] Project built successfully
- [x] Tests passing (100%)
- [x] Claude Desktop configured
- [x] Tools visible in Claude Desktop
- [x] Successfully used at least one tool

**Congratulations! You're ready to use MCP YouTube Transcript Pro! 🎉**

---

**Estimated Time**: 5-10 minutes  
**Difficulty**: Beginner-friendly  
**Last Updated**: October 14, 2025
