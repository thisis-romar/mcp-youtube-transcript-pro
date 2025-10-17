# Development Guide - MCP YouTube Transcript Pro

## Project Overview

This is a professional Model Context Protocol (MCP) server for fetching YouTube video transcripts. It implements a comprehensive toolset that prioritizes official captions via the YouTube Data API and falls back to web extraction when needed.

## Development Setup

### Prerequisites

- Node.js 20+ or compatible runtime
- npm or yarn package manager
- YouTube Data API key (optional for development, required for production)

### Initial Setup

1. **Clone and Install**
   ```bash
   cd h:\-EMBLEM-PROJECT(s)-\Tools\packages\mcp-youtube-transcript-pro
   npm install --legacy-peer-deps
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your YOUTUBE_API_KEY
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

## VS Code Tasks

The project includes several VS Code tasks (accessible via `Ctrl+Shift+P` → `Tasks: Run Task`):

### Available Tasks

1. **Install Dependencies** - Installs npm packages with correct flags
2. **Build** (Default Build Task: `Ctrl+Shift+B`) - Compiles TypeScript to JavaScript
3. **Start Server** - Runs the compiled server
4. **Dev Mode** - Runs in development mode with ts-node for quick iteration
5. **Lint** - Checks code quality with ESLint
6. **Test** (Default Test Task) - Runs Jest tests
7. **Build and Start** - Composite task that builds then starts the server

## Project Structure

```
mcp-youtube-transcript-pro/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools.ts              # Tool implementations (get_transcript, etc.)
│   ├── types.ts              # TypeScript interfaces
│   └── adapters/
│       ├── youtube_api.ts    # YouTube Data API adapter
│       └── web_extraction.ts # Web scraping fallback adapter
├── dist/                     # Compiled JavaScript (generated)
├── .vscode/
│   └── tasks.json           # VS Code task definitions
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
├── .env.example
└── README.md
```

## Implementation Status

### ✅ Completed
- Project scaffolding and structure
- TypeScript configuration
- Build system (tsc)
- VS Code tasks
- Basic type definitions
- Adapter structure

### 🚧 In Progress / To Do

#### 1. Core Logic Implementation
- [ ] Parse video IDs from various URL formats
- [ ] Implement `list_tracks()` to query YouTube Data API for caption tracks
- [ ] Implement `get_transcript()` to return plain text transcript
- [ ] Implement `get_timed_transcript()` to return timestamped segments
- [ ] Implement `get_video_info()` to fetch video metadata
- [ ] Add fallback logic: API → Web Extraction → Error

#### 2. MCP Server Protocol
- [ ] Implement JSON-RPC request/response handling
- [ ] Read from stdin, write to stdout
- [ ] Proper MCP tool registration and manifest
- [ ] Structured error responses with error codes

#### 3. Error Handling & Resilience
- [ ] Typed error classes (NotFoundError, RateLimitError, etc.)
- [ ] Retry logic with exponential backoff
- [ ] Timeout handling
- [ ] Graceful degradation when API key is missing

#### 4. Testing
- [ ] Unit tests for each tool
- [ ] Mock YouTube API responses
- [ ] Integration tests with real API (using test videos)
- [ ] Edge case testing (private videos, no captions, etc.)

#### 5. Caching & Performance
- [ ] ETag/If-Modified-Since support
- [ ] LRU cache for transcripts
- [ ] Response streaming for large transcripts

#### 6. Documentation
- [ ] TSDoc comments for all functions
- [ ] API usage examples
- [ ] Deployment guide
- [ ] SECURITY.md
- [ ] CONTRIBUTING.md

## Development Workflow

### Daily Development Loop

1. **Make Changes** - Edit TypeScript files in `src/`
2. **Build** - Run `Ctrl+Shift+B` or `npm run build`
3. **Test** - Run the Test task or `npm test`
4. **Lint** - Check code quality with the Lint task
5. **Commit** - Use AI-attributed commits (see workspace guidelines)

### Testing Locally

To test the server with a real MCP client:

1. Build the project: `npm run build`
2. Configure your MCP client (e.g., Claude Desktop) to point to this server
3. Test with various YouTube URLs

### Debugging

- Use `npm run dev` to run with ts-node for faster iteration
- Add `console.log()` statements (they'll appear in the MCP client's logs)
- Check VS Code's Terminal output for compilation errors

## Next Implementation Steps

### Phase 1: URL Parsing (Priority: High)
Create a utility function to extract video IDs from various YouTube URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- `https://www.youtube.com/live/VIDEO_ID`

### Phase 2: YouTube API Integration (Priority: High)
Implement the `listCaptionTracks()` function in `youtube_api.ts`:
- Call `youtube.captions.list()` to get available tracks
- Identify manual vs. auto-generated captions
- Handle authentication errors gracefully

### Phase 3: Web Extraction Fallback (Priority: Medium)
Enhance `web_extraction.ts`:
- Add language detection
- Handle multiple caption formats
- Proper error handling for restricted videos

### Phase 4: MCP Protocol Implementation (Priority: High)
Update `index.ts` to be a real MCP server:
- Parse JSON-RPC 2.0 requests from stdin
- Route to appropriate tool function
- Format responses according to MCP spec
- Handle errors as per MCP error codes

### Phase 5: Testing & Quality (Priority: Medium)
- Write comprehensive unit tests
- Set up CI/CD pipeline
- Add integration tests with real YouTube videos
- Performance benchmarking

## Useful Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build
npm run build

# Run in dev mode
npm run dev

# Lint code
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode for development
npm run build -- --watch
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install --legacy-peer-deps`
- Check TypeScript version: `npx tsc --version`
- Clear build cache: `rm -rf dist && npm run build`

### API Errors
- Verify `YOUTUBE_API_KEY` is set in `.env`
- Check API quota limits in Google Cloud Console
- Ensure the YouTube Data API v3 is enabled

### Import Errors
- If `cannot find module` errors occur, rebuild: `npm run build`
- Check that all imports use the correct relative paths

## Resources

- [Model Context Protocol Spec](https://modelcontextprotocol.io/specification/2025-06-18)
- [YouTube Data API - Captions](https://developers.google.com/youtube/v3/docs/captions)
- [YouTube Transcript Library](https://www.npmjs.com/package/youtube-transcript)

## Contributing

See the main workspace documentation for:
- AI Attribution Standards for commits
- Git workflow and branching strategy
- Code review process
