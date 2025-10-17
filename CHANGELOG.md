# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-17

### Added
- **Preprocessing Options** for `get_timed_transcript` tool:
  - `filterEmpty` parameter: Remove segments with empty or whitespace-only text
  - `mergeOverlaps` parameter: Merge segments with overlapping timestamps
  - `removeSilence` parameter: Remove silence markers like \[silence\], \[pause\], \[Music\]
- Comprehensive preprocessing documentation in README.md
- 28 unit tests for preprocessing functions with 100% code coverage
- TypeScript interfaces for all preprocessing options

### Changed
- Enhanced `get_timed_transcript` to support optional preprocessing before formatting
- Updated MCP tool schema to include new preprocessing parameters
- Preprocessing is applied in order: removeSilence → filterEmpty → mergeOverlaps

### Technical Details
- All preprocessing options are **optional** and default to `false`
- **100% backward compatible** - existing code works without changes
- Pure functions for composable preprocessing pipeline
- Zero dependencies added

### Use Cases
- **filterEmpty**: Clean auto-generated captions with timing gaps
- **mergeOverlaps**: Fix word-level timing issues in YouTube captions
- **removeSilence**: Create reading-friendly transcripts without markers
- **Combined**: Optimize subtitle files with all 3 options enabled

## [1.0.0] - 2025-10-15

### Added
- Initial release with 4 MCP tools
- `list_tracks`: List available caption tracks
- `get_transcript`: Plain text transcript
- `get_timed_transcript`: Timestamped segments with 5 format options (JSON, SRT, VTT, CSV, TXT)
- `get_video_info`: Video metadata with duration and caption availability
- Hybrid architecture: YouTube Data API v3 + yt-dlp
- Full MCP protocol compliance (JSON-RPC 2.0 over stdin/stdout)
- Comprehensive test suite (test-mcp-tools.ts, test-mcp-protocol.ts)
- TypeScript with strict types
- Format converters for SRT, VTT, CSV, TXT
- Production-ready error handling and logging

[1.1.0]: https://github.com/yourusername/mcp-youtube-transcript-pro/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/mcp-youtube-transcript-pro/releases/tag/v1.0.0
