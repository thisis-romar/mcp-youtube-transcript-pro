# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-10-18

### Added
- **Large Response Handling** for `get_timed_transcript` tool:
  - `outputFile` parameter: Write transcript content directly to file
    * Supports absolute and relative file paths
    * Auto-creates parent directories recursively  
    * Returns success message with metadata instead of large content
    * Prevents conversation context overflow with 200KB+ files
  - `preview` parameter: Truncate response content to prevent context overflow
    * Boolean `true` = default 5000 character limit
    * Number = custom character limit (any positive number)
    * JSON format returns structured preview object with metadata
    * Text formats return truncated string with omission message
    * Works independently or combined with `outputFile`
- Comprehensive large response handling documentation in README.md
- Test 6: outputFile parameter tests (all 5 formats + error cases)
- Test 7: preview parameter tests (boolean, number, combined with outputFile)
- Large Response Handling decision table for choosing the right approach

### Changed
- Refactored `get_timed_transcript` to support file writing and preview truncation
  * Removed early return from outputFile handler to enable parameter combination
  * Added format-specific preview logic (JSON vs text formats)
  * Single return statement at end of function for cleaner control flow
- Updated MCP tool schema to include `outputFile` and `preview` parameters
- Enhanced test suite: 7 test suites covering all functionality

### Technical Details
- **100% backward compatible** - existing code works without changes
- Both parameters are **optional** and can be used independently or together
- Format-specific preview truncation:
  * JSON: Structured object with segmentsShown, totalSegments, segmentsOmitted
  * Text formats: Truncated string with "... [Preview truncated, N more characters omitted] ..." message
- File writing uses Node.js fs/promises with UTF-8 encoding
- Parent directory creation uses `{recursive: true}` for safe path handling

### Use Cases
- **outputFile only**: Save large transcripts (1hr+ videos) to file, avoid context overflow
- **preview only**: View snippet of transcript content before deciding to save  
- **Both combined**: Save full content to file + preview in conversation (best of both worlds)
- **Automation workflows**: Direct file output for processing pipelines
- **Quick verification**: Short previews (e.g., `preview: 500`) for content validation

### Bug Fixes
- Fixed empty string validation for `outputFile` parameter (now checks `undefined` instead of falsy)
- Improved error messages for file write failures (includes file path and reason)

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
