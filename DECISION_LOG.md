# Decision Log - MCP YouTube Transcript Pro

**Project:** YouTube Transcript MCP Server  
**Date:** October 16, 2025  
**Status:** ✅ Scaffold Complete → 🚧 Implementation Phase  
**Repository:** `tools-repository` (branch: TBD)

---

## Decision Summary

### 🎯 Objective
Identify or build the best Model Context Protocol server for fetching YouTube video transcripts with full MCP compliance.

### 📊 Evaluation Results

**Candidates Evaluated:** 4  
**Fully Compliant:** 0  
**Best Score:** 0.65/1.00 (`jkawamoto/mcp-youtube-transcript`)  
**Adoption Threshold:** 0.85  
**Decision:** **Build New Server**

---

## Key Decision Points

### 1. Buy vs. Build Analysis

| Option | Score | Pros | Cons | Decision |
|--------|-------|------|------|----------|
| Adopt `jkawamoto` | 0.65 | 3/4 tools, pagination | Missing `list_tracks`, Python, unclear API usage | ❌ Reject |
| Fork `jkawamoto` | N/A | Existing base | Major refactor needed, language mismatch | ❌ Reject |
| Build New | N/A | Full control, TypeScript, clean design | More initial work | ✅ **Selected** |

**Critical Gap in All Candidates:**
- **No `list_tracks` implementation** - Essential for distinguishing official vs. auto-generated captions
- Cannot expose caption source provenance
- Limited multi-language track selection

### 2. Technology Stack Selection

**Language:** TypeScript  
**Runtime:** Node.js 20+ (also compatible with Deno/Cloudflare Workers)  
**Key Dependencies:**
- `googleapis` - Official YouTube Data API client
- `youtube-transcript` - Web extraction fallback
- TypeScript, Jest, ESLint for quality

**Rationale:**
- Aligns with workspace development standards
- Strong typing reduces runtime errors
- Excellent MCP library support
- Easy deployment options

### 3. Architecture Decisions

**Adapter Pattern:**
- Primary: YouTube Data API for official captions
- Fallback: Web extraction for unavailable videos
- Optional: ASR integration hook for future expansion

**Tool Signatures:**
```typescript
list_tracks(url: string): CaptionTrack[]
get_transcript(url: string, lang?: string): string
get_timed_transcript(url: string, lang?: string): TranscriptSegment[]
get_video_info(url: string): VideoInfo
```

**Error Taxonomy:**
- `NotFoundError` - Video doesn't exist
- `NoCaptionsError` - No captions available
- `RateLimitError` - API quota exceeded
- `ForbiddenError` - Private/restricted video
- `TimeoutError` - Request timed out

---

## Project Status

### ✅ Phase 0: Scaffolding (COMPLETE)

**Completed:**
- [x] Project directory structure
- [x] `package.json` with all dependencies
- [x] TypeScript configuration (`tsconfig.json`)
- [x] Type definitions (`src/types.ts`)
- [x] Tool stubs (`src/tools.ts`)
- [x] Adapter stubs (`src/adapters/`)
- [x] Main server entry point (`src/index.ts`)
- [x] ESLint configuration
- [x] Jest configuration
- [x] VS Code tasks (`.vscode/tasks.json`)
- [x] Documentation (`README.md`, `DEVELOPMENT.md`, `DISCOVERY_REPORT.md`)
- [x] Docker configuration
- [x] `.env.example` for configuration
- [x] **Build verification** - TypeScript compiles successfully

**Artifacts Generated:**
```
dist/
├── adapters/
│   ├── youtube_api.js
│   └── web_extraction.js
├── index.js
├── tools.js
└── types.js
```

### 🚧 Phase 1: Core Implementation (NEXT)

**Priority: High**

1. **URL Parsing Utility**
   - Extract video ID from various YouTube URL formats
   - Validate video ID format (11 characters, alphanumeric)
   - Support: `youtube.com/watch`, `youtu.be`, `shorts`, `live`, `embed`

2. **YouTube API Integration**
   - Implement `listCaptionTracks()` in `youtube_api.ts`
   - Implement `getVideoInfo()` for metadata
   - Handle API authentication errors
   - Respect rate limits

3. **Web Extraction Fallback**
   - Enhance `getYouTubeTranscript()` in `web_extraction.ts`
   - Add language detection
   - Handle restricted content gracefully

4. **Tool Implementation**
   - Complete logic in `src/tools.ts`
   - Implement fallback chain: API → Web → Error
   - Add caching layer

### 🎯 Phase 2: MCP Protocol (HIGH PRIORITY)

**Priority: High**

1. **JSON-RPC Handler**
   - Parse JSON-RPC 2.0 requests from stdin
   - Route to appropriate tool
   - Format MCP-compliant responses
   - Implement tool registration/manifest

2. **Error Handling**
   - Map errors to MCP error codes
   - Include retry-after headers for rate limits
   - Structured error responses

### 🧪 Phase 3: Testing & Quality

**Priority: Medium**

1. **Unit Tests**
   - Test each tool independently
   - Mock YouTube API responses
   - Test error scenarios

2. **Integration Tests**
   - Test with real YouTube videos
   - Verify full workflow: URL → API → Transcript
   - Test edge cases (private, no captions, Shorts)

3. **Performance Tests**
   - Measure P50 latency
   - Verify coverage (±1% of video duration)
   - Test long videos (pagination)

### 📦 Phase 4: Deployment & Documentation

**Priority: Low (after core works)**

1. **Deployment**
   - Docker image optimization
   - Cloudflare Workers adapter (optional)
   - CI/CD pipeline setup

2. **Documentation**
   - TSDoc comments
   - API usage examples
   - SECURITY.md
   - CONTRIBUTING.md

---

## Implementation Roadmap

### Week 1: Core Functionality
- [ ] URL parsing utility
- [ ] YouTube API integration
- [ ] Basic `get_timed_transcript` working

### Week 2: MCP Protocol & Testing
- [ ] JSON-RPC handler
- [ ] Tool registration
- [ ] Unit tests
- [ ] Integration with Claude Desktop

### Week 3: Polish & Deploy
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Documentation finalization
- [ ] Docker deployment

---

## Success Criteria

### Functional Requirements
- ✅ All 4 tools implemented (`list_tracks`, `get_transcript`, `get_timed_transcript`, `get_video_info`)
- ✅ Official YouTube API as primary source
- ✅ Web extraction fallback
- ✅ Timestamped segments with source provenance
- ✅ Language selection support

### Quality Metrics
- ⏱️ P50 latency < 2.5s for API-available videos
- 📊 >99% segment coverage (±1% of video duration)
- 🎯 Zero data loss (Unicode, punctuation preserved)
- 🛡️ Graceful error handling for all edge cases

### MCP Compliance
- ✅ Valid MCP server manifest
- ✅ JSON-RPC 2.0 protocol
- ✅ Structured error responses
- ✅ Deterministic tool signatures

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| YouTube API quota limits | Medium | High | Implement caching, fallback to web extraction |
| Web scraping breakage | Low | Medium | Use maintained library (`youtube-transcript`), monitor updates |
| MCP spec changes | Low | Low | Follow official spec, subscribe to updates |
| Performance issues (large videos) | Medium | Medium | Implement pagination, streaming responses |

---

## Next Actions

### Immediate (This Session)
1. ✅ Create project scaffold - **DONE**
2. ✅ Set up VS Code tasks - **DONE**
3. ✅ Verify build - **DONE**
4. ✅ Create documentation - **DONE**

### Next Development Session
1. 🔨 Implement URL parsing utility
2. 🔨 Implement `list_tracks()` with YouTube API
3. 🔨 Test with target video: `https://www.youtube.com/watch?v=lxRAj1Gijic`
4. 🔨 Implement basic MCP JSON-RPC handler

### Before Production
1. 📝 Complete all unit tests
2. 🔐 Add proper API key management
3. 📊 Performance benchmarking
4. 🚀 Create deployment documentation

---

## AI Attribution

**Model:** copilot/claude-sonnet-4.5 (Anthropic)  
**Session:** TBD (current session ID to be added)  
**Context:** Multi-project workspace with AI attribution tools  
**Tools Used:**
- Sequential Thinking MCP (problem decomposition)
- AI Model Detector MCP (attribution metadata)
- VS Code Copilot Chat (code generation)

---

## References

- **MCP Specification:** https://modelcontextprotocol.io/specification/2025-06-18
- **YouTube Data API:** https://developers.google.com/youtube/v3/docs/captions
- **Project Blueprint:** See prompt in initial user request
- **Discovery Report:** See `DISCOVERY_REPORT.md`
- **Development Guide:** See `DEVELOPMENT.md`

---

**Last Updated:** October 16, 2025  
**Status:** Scaffold complete, ready for Phase 1 implementation  
**Next Review:** After Phase 1 completion
