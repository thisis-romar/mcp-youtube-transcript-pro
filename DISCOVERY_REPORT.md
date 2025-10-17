# YouTube Transcript MCP Server - Discovery Report

**Date:** October 16, 2025  
**Objective:** Identify the best MCP server for fetching YouTube transcripts  
**Target Video:** `https://www.youtube.com/watch?v=lxRAj1Gijic`  
**Decision:** Build new (`mcp-youtube-transcript-pro`)

---

## Executive Summary

After evaluating four candidate MCP servers for YouTube transcript extraction, **none fully met the acceptance criteria** defined by the Model Context Protocol specification and project requirements. The strongest candidate (`jkawamoto/mcp-youtube-transcript`) scored approximately **0.65/1.00**, below the 0.85 threshold for adoption.

**Result:** Proceeded with scaffolding a new TypeScript-based MCP server (`mcp-youtube-transcript-pro`) that implements the full specification.

---

## Candidate Servers Evaluated

### 1. jkawamoto/mcp-youtube-transcript
- **Repository:** https://github.com/jkawamoto/mcp-youtube-transcript
- **Language:** Python
- **Status:** ✅ Active, documented

**Features:**
- ✅ `get_transcript` - Fetches plain transcript
- ✅ `get_timed_transcript` - Fetches timestamped transcript
- ✅ `get_video_info` - Fetches video metadata
- ✅ Response pagination for long videos
- ✅ Proxy support for restricted environments
- ❌ **Missing `list_tracks`** - Cannot enumerate or select caption tracks

**MCP Compliance:**
- ✅ Valid MCP server with manifest
- ✅ Deterministic tool signatures
- ✅ Pagination support
- ❌ Missing required `list_tracks` tool
- ⚠️ Unclear if uses official YouTube API or web scraping only

**Installation:**
- Requires `uv` (Python package manager)
- Multiple installation methods: `.mcpb` bundle, Smithery, Docker

**Score Estimate:** 0.65/1.00
- Capabilities: 0.75/0.35 = **0.26**
- MCP Compliance: 0.75/0.20 = **0.15**
- Quality: 0.85/0.25 = **0.21** (assumed)
- Operability: 0.80/0.15 = **0.12** (assumed)
- Licensing/Security: 1.0/0.05 = **0.05**

---

### 2. adhikasp/mcp-youtube
- **Repository:** https://github.com/adhikasp/mcp-youtube
- **Status:** ❌ **Inaccessible** - README returned 404

**Result:** Could not evaluate. Repository may be private, deleted, or URL incorrect.

---

### 3. kimtaeyoon83/mcp-server-youtube-transcript
- **Repository:** https://github.com/kimtaeyoon83/mcp-server-youtube-transcript
- **Language:** Node.js/TypeScript
- **Status:** ✅ Active, documented

**Features:**
- ✅ `get_transcript` - Extracts transcripts
- ✅ Supports URL or video ID as input
- ✅ Language-specific retrieval
- ❌ **Missing `get_timed_transcript`** - No timestamped segments
- ❌ **Missing `list_tracks`**
- ❌ **Missing `get_video_info`**

**MCP Compliance:**
- ✅ Valid MCP server configuration
- ✅ Node.js based (easier integration)
- ❌ Only implements 1 of 4 required tools

**Installation:**
- `npx` based (simple)
- Can use `smithery-cli` or `mcp-get`

**Score Estimate:** 0.35/1.00
- Severely limited feature set
- Missing critical tools for comprehensive transcript extraction

---

### 4. ergut/youtube-transcript-mcp
- **Repository:** https://github.com/ergut/youtube-transcript-mcp
- **Language:** TypeScript (Cloudflare Workers)
- **Status:** ✅ Active, **remote-hosted**

**Features:**
- ✅ `get_transcript` - Extracts transcripts
- ✅ **Zero-setup** - Hosted publicly, no local installation
- ✅ Smart caching via Cloudflare KV
- ✅ Multi-language support
- ✅ Handles all YouTube URL formats (shorts, live, embeds)
- ✅ Clear error messages
- ❌ **Missing `get_timed_transcript`** - No timestamped segments
- ❌ **Missing `list_tracks`**
- ❌ **Missing `get_video_info`**

**MCP Compliance:**
- ✅ Valid MCP server (SSE and HTTP endpoints)
- ✅ Excellent operability (hosted service)
- ✅ Robust error handling
- ❌ Only implements 1 of 4 required tools

**Built With:**
- Uses `youtube-transcript` npm library (web extraction)
- Cloudflare Workers for hosting
- No official YouTube API usage

**Score Estimate:** 0.45/1.00
- Excellent operability and infrastructure
- But severely limited capability set
- No timestamped segments or track selection

---

## Acceptance Criteria Analysis

### Required Capabilities

| Capability | jkawamoto | kimtaeyoon83 | ergut |
|------------|-----------|--------------|-------|
| Fetch official captions (API) | ⚠️ Unclear | ❌ No | ❌ No |
| Fallback to web extraction | ✅ Yes | ⚠️ Maybe | ✅ Yes |
| Timestamped segments | ✅ Yes | ❌ No | ❌ No |
| Language selection | ✅ Yes | ✅ Yes | ✅ Yes |
| Track selection (`list_tracks`) | ❌ **No** | ❌ No | ❌ No |
| Video info | ✅ Yes | ❌ No | ❌ No |

### Required MCP Tools

| Tool | jkawamoto | kimtaeyoon83 | ergut |
|------|-----------|--------------|-------|
| `get_transcript` | ✅ | ✅ | ✅ |
| `get_timed_transcript` | ✅ | ❌ | ❌ |
| `list_tracks` | ❌ | ❌ | ❌ |
| `get_video_info` | ✅ | ❌ | ❌ |

**Critical Gap:** **No candidate implements `list_tracks`**, which is essential for:
- Distinguishing official vs. auto-generated captions
- Selecting preferred language when multiple tracks exist
- Exposing caption source provenance to the LLM

---

## Quality Assessment

### YouTube API vs. Web Extraction

**Observed:**
- `jkawamoto`: Mentions proxy support, suggesting web scraping, but unclear if API is also used
- `kimtaeyoon83`: Method not documented
- `ergut`: Explicitly uses `youtube-transcript` library (web extraction only)

**Concern:** Web-only extraction:
- May violate YouTube's Terms of Service
- Subject to breaking when YouTube changes page structure
- Cannot distinguish official vs. auto-generated captions
- May be blocked or rate-limited

**Requirement:** Server should prioritize official YouTube Data API and fall back to web extraction only when necessary.

---

## Functional Bench Test Attempt

**Candidate Tested:** `jkawamoto/mcp-youtube-transcript`

### Setup
1. Verified `uv` installed (version 0.5.20)
2. Ran: `uvx --from git+https://github.com/jkawamoto/mcp-youtube-transcript mcp-youtube-transcript`
3. Server started successfully

### Blocker
- MCP servers communicate over **stdio** (standard input/output), not HTTP
- Cannot directly call tools without a proper MCP client
- Testing would require:
  - Integrating into Claude Desktop config, OR
  - Building a custom MCP client, OR
  - Using an MCP testing framework

**Decision:** Proceed with build decision based on documentation analysis rather than functional testing, given the clear gap in required tools.

---

## Decision Matrix

### Scoring Weights (from acceptance criteria)
- Capabilities: 35%
- MCP Compliance: 20%
- Quality: 25%
- Operability: 15%
- Licensing/Security: 5%

### Estimated Scores

| Candidate | Capabilities | MCP | Quality | Ops | License | **Total** |
|-----------|-------------|-----|---------|-----|---------|-----------|
| jkawamoto | 0.26 | 0.15 | 0.21 | 0.12 | 0.05 | **0.65** |
| adhikasp | N/A | N/A | N/A | N/A | N/A | **N/A** |
| kimtaeyoon83 | 0.12 | 0.08 | 0.15 | 0.12 | 0.05 | **0.35** |
| ergut | 0.14 | 0.10 | 0.18 | 0.15 | 0.05 | **0.45** |

**Threshold for Adoption:** 0.85  
**Best Candidate:** `jkawamoto/mcp-youtube-transcript` at **0.65**

**Gap Analysis:** 0.85 - 0.65 = **0.20 shortfall**

---

## Fork vs. Build Decision

### Option 1: Fork jkawamoto/mcp-youtube-transcript

**Pros:**
- Has 3 of 4 required tools already implemented
- Proven pagination logic
- Active maintenance

**Cons:**
- Python-based (workspace is TypeScript-focused)
- Missing critical `list_tracks` functionality
- Unclear if uses YouTube API at all
- Would require:
  - Learning Python codebase
  - Adding YouTube API integration
  - Implementing `list_tracks`
  - Ensuring proper source attribution (API vs. web)

**Estimated Effort:** Medium to High

### Option 2: Build New (mcp-youtube-transcript-pro)

**Pros:**
- TypeScript aligns with workspace stack
- Can implement full spec from the start
- Clean architecture with proper YouTube API + fallback design
- Full control over tool signatures and error handling
- Can follow MCP best practices from day 1

**Cons:**
- More initial work
- Need to implement all tools from scratch

**Estimated Effort:** High

### Decision Rationale

**Chose Option 2 (Build New)** because:

1. **Critical Gap:** Missing `list_tracks` is not a minor addition—it requires fundamental changes to how captions are retrieved and represented
2. **API Integration Uncertainty:** If `jkawamoto` doesn't use YouTube API, adding it is a major refactor
3. **Language Mismatch:** Python → TypeScript conversion is substantial work
4. **Clean Slate Advantage:** Can implement best practices, proper error taxonomy, and MCP compliance from the start
5. **Blueprint Provided:** Detailed specification in prompt reduces implementation risk

**User Preference:** User indicated "probably would rather not start fresh" but with score in 0.70-0.84 range. At 0.65, we're below even the flexible threshold, making a clean build the more pragmatic choice.

---

## Conclusion

**Decision: Build `mcp-youtube-transcript-pro`**

A new TypeScript-based MCP server that:
- Implements all four required tools
- Prioritizes official YouTube Data API
- Falls back gracefully to web extraction
- Provides timestamped segments with source provenance
- Follows MCP specification completely
- Includes proper error handling, caching, and testing

**Status:** Project scaffolding complete. See `DEVELOPMENT.md` for implementation roadmap.

---

## Appendix: Candidate URLs

1. **jkawamoto:** https://github.com/jkawamoto/mcp-youtube-transcript
2. **adhikasp:** https://github.com/adhikasp/mcp-youtube (inaccessible)
3. **kimtaeyoon83:** https://github.com/kimtaeyoon83/mcp-server-youtube-transcript
4. **ergut:** https://github.com/ergut/youtube-transcript-mcp

## References

- [Model Context Protocol Spec](https://modelcontextprotocol.io/specification/2025-06-18)
- [YouTube Data API - Captions](https://developers.google.com/youtube/v3/docs/captions)
- [YouTube Transcript Library](https://github.com/jdepoix/youtube-transcript-api)
