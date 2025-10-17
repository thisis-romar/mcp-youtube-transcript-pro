# Critical Finding: YouTube API Caption Download Limitation

**Date:** October 16, 2025  
**Issue:** `captions.download()` requires OAuth 2.0, not just API key

---

## Problem

The YouTube Data API has two authentication levels:

### API Key (What We Have) ✅
- Can **list** available caption tracks
- Can get video metadata
- Can check if captions exist
- **Cannot download caption content**

### OAuth 2.0 (What We Need for Download) ❌
- Requires user consent flow
- Needs video owner permission
- Not suitable for automated MCP server
- Complex setup for end users

---

## Error Details

```
Error: Login Required.
Code: 401
Details: "Authorization" header requires OAuth 2.0
```

**API Endpoint:** `youtube.captions.download()`  
**Required Auth:** OAuth 2.0 with scope `https://www.googleapis.com/auth/youtube.force-ssl`

---

## Architectural Implications

### ❌ YouTube Data API Cannot Be Our Primary Source

The YouTube Data API is **not viable** for automated transcript extraction because:

1. **Requires OAuth flow** - Not suitable for MCP server use case
2. **Needs video owner permission** - Can't access arbitrary public videos
3. **Complex user setup** - Defeats "zero-setup" goal

### ✅ What the API IS Good For

- **Checking if captions exist** (via `captions.list()`)
- **Getting caption metadata** (language, type, track kind)
- **Video information** (title, duration, channel)

---

## Revised Architecture

### New Strategy: Hybrid Approach

```
┌─────────────────────────────────────────────┐
│  1. YouTube Data API (Metadata Only)        │
│     ├─ Check if captions exist              │
│     ├─ Get available languages              │
│     └─ Distinguish manual vs. auto          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. Web Extraction (Actual Content)         │
│     ├─ Download transcript via scraping     │
│     ├─ Parse and structure data             │
│     └─ Fallback if API metadata fails       │
└─────────────────────────────────────────────┘
```

### Benefits of Hybrid Approach

1. **Best of Both Worlds**
   - API provides reliable metadata
   - Web extraction gets actual content
   
2. **No OAuth Required**
   - Simple API key for metadata
   - No user consent flow needed
   
3. **Better Error Handling**
   - Know *before* scraping if captions exist
   - Distinguish "no captions" from "scraping failed"

---

## Alternative Solutions

### Option 1: Fix the Web Extraction Library ⭐ RECOMMENDED

The `youtube-transcript` npm library returned 0 segments, but there might be:

1. **Newer versions** with fixes
2. **Configuration issues** (language param, etc.)
3. **Alternative libraries** that work better

**Action:** Research and test alternative web extraction methods.

### Option 2: Use yt-dlp

`yt-dlp` is a robust, actively maintained tool that can extract captions:

```bash
yt-dlp --write-auto-sub --skip-download --sub-format json3 VIDEO_URL
```

**Pros:**
- Very reliable
- Handles many edge cases
- Active development

**Cons:**
- Requires Python or binary installation
- Not a native TypeScript solution

### Option 3: Custom Web Scraping

Implement our own parser for YouTube's player response:

**Pros:**
- Full control
- No external dependencies

**Cons:**
- High maintenance
- Breaks when YouTube updates
- Need to handle anti-scraping

### Option 4: YouTube Transcript API (Python)

Call Python's `youtube-transcript-api` library via child process:

**Pros:**
- More actively maintained than npm version
- Known to work

**Cons:**
- Requires Python runtime
- IPC complexity

---

## Recommended Next Steps

### Immediate (High Priority)

1. ✅ **Keep YouTube API for Metadata**
   - Implement `list_tracks()` properly
   - Implement `get_video_info()` properly
   - Use for checking caption availability

2. 🔧 **Fix Web Extraction**
   - Test alternative npm libraries
   - Try with language parameter
   - Consider yt-dlp integration

3. 🧪 **Test Hybrid Approach**
   - API check → Web download workflow
   - Verify data consistency

### Documentation Updates

- Update `DISCOVERY_REPORT.md` with API limitation
- Document authentication requirements
- Update implementation roadmap

---

## Impact on Original Acceptance Criteria

### Updated Capabilities

| Requirement | Status | Method |
|-------------|--------|--------|
| Fetch official captions | ⚠️ Metadata only | YouTube API |
| Get actual transcript content | 🔧 Needs fix | Web extraction |
| Distinguish manual vs. auto | ✅ Yes | YouTube API |
| Timestamped segments | 🔧 Needs fix | Web extraction |
| Language selection | ✅ Yes | YouTube API + Web |
| Multi-track support | ✅ Yes | YouTube API lists all |

### Conclusion

The YouTube Data API **cannot download captions** without OAuth, which is not feasible for an automated MCP server. We must:

1. Use API for **metadata and validation**
2. Use **web extraction for content**
3. Fix or replace the web extraction library

This hybrid approach is still superior to web-only scraping because we get reliable metadata first.

---

**Status:** Need to implement working web extraction method.  
**Blocker:** `youtube-transcript` npm library doesn't work.  
**Next:** Test alternative web extraction approaches.
