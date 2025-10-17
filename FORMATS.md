# YouTube Transcript Output Formats

Comprehensive guide to the 5 output formats supported by MCP YouTube Transcript Pro.

## Table of Contents

- [Quick Comparison](#quick-comparison)
- [Format Specifications](#format-specifications)
  - [JSON](#json-format)
  - [SRT (SubRip)](#srt-format-subrip)
  - [VTT (WebVTT)](#vtt-format-webvtt)
  - [CSV](#csv-format)
  - [TXT (Plain Text)](#txt-format-plain-text)
- [Decision Tree: Which Format Should I Use?](#decision-tree-which-format-should-i-use)
- [Compatibility Matrix](#compatibility-matrix)
- [Size Comparison](#size-comparison)
- [Official Specifications](#official-specifications)

---

## Quick Comparison

| Format | Extension | MIME Type | Type | Primary Use Case |
|--------|-----------|-----------|------|------------------|
| **JSON** | `.json` | `application/json` | Array | APIs, programming, structured data |
| **SRT** | `.srt` | `text/srt` | String | Video editing (Premiere, Final Cut, DaVinci) |
| **VTT** | `.vtt` | `text/vtt` | String | Web browsers (HTML5 video, YouTube) |
| **CSV** | `.csv` | `text/csv` | String | Spreadsheets (Excel, Google Sheets), data analysis |
| **TXT** | `.txt` | `text/plain` | String | Human reading, documentation, text extraction |

---

## Format Specifications

### JSON Format

**Default format** - Returns structured TypeScript data as array of `TranscriptSegment` objects.

#### Use Cases
- API integration and data processing
- TypeScript/JavaScript applications with type safety
- Complex querying and filtering
- Preserving all metadata (language, source, precise timestamps)

#### Example Output
```json
[
  {
    "start": 0.08,
    "end": 0.32,
    "text": "today",
    "lang": "en",
    "source": "youtube_api_manual"
  },
  {
    "start": 0.32,
    "end": 0.64,
    "text": "we're going to enhance",
    "lang": "en",
    "source": "youtube_api_manual"
  },
  {
    "start": 0.64,
    "end": 1.12,
    "text": "your VS Code",
    "lang": "en",
    "source": "youtube_api_manual"
  }
]
```

#### Key Features
- ✅ **Type safety** with TypeScript definitions
- ✅ **Precise timestamps** (fractional seconds)
- ✅ **Full metadata** preserved (language, source)
- ✅ **Programmatic access** to all properties
- ✅ **Standard JSON** parsing in any language

#### Pros & Cons

**Pros:**
- Complete data structure with all information
- Easy to parse in any programming language
- Type-safe with provided TypeScript interfaces
- Supports complex queries and transformations
- Standard format understood by all tools

**Cons:**
- Largest file size (~290 KB for 15min video)
- Not directly usable in video editors
- Requires parsing for human reading
- Contains technical metadata

#### Compatibility
- ✅ All programming languages (Python, JavaScript, etc.)
- ✅ REST APIs and web services
- ✅ Database imports (MongoDB, PostgreSQL JSON columns)
- ✅ Data analysis tools (jq, pandas)
- ❌ Video editing software (use SRT/VTT instead)

---

### SRT Format (SubRip)

Industry-standard subtitle format for video editing software.

#### Use Cases
- Adding subtitles in video editing software
- Creating burned-in captions
- Offline subtitle files for media players
- Professional video production workflows

#### Example Output
```srt
1
00:00:00,080 --> 00:00:00,320
today

2
00:00:00,320 --> 00:00:00,640
we're going to enhance

3
00:00:00,640 --> 00:00:01,120
your VS Code

4
00:00:01,120 --> 00:00:01,600
to ensure that you've got

5
00:00:01,600 --> 00:00:02,080
the most efficient workspace
```

#### Key Features
- ✅ **Sequence numbers** (1, 2, 3...)
- ✅ **Comma separator** in timestamps (`HH:MM:SS,mmm`)
- ✅ **Blank line** separators between entries
- ✅ **HTML entity decoding** (`&amp;` → `&`, `&lt;` → `<`)
- ✅ **Universally supported** by video editing software

#### Pros & Cons

**Pros:**
- Universal video editing compatibility
- Human-readable format
- Small file size (~144 KB, 50% smaller than JSON)
- Easy to manually edit
- Widely documented standard

**Cons:**
- No styling/formatting support
- No metadata preservation
- Requires parsing for data analysis
- Not ideal for web browsers (use VTT)

#### Compatibility
- ✅ Adobe Premiere Pro
- ✅ Final Cut Pro
- ✅ DaVinci Resolve
- ✅ VLC Media Player
- ✅ MPC-HC / MPC-BE
- ✅ HandBrake
- ⚠️ Web browsers (limited support, use VTT instead)

---

### VTT Format (WebVTT)

W3C standard for web video captions and subtitles.

#### Use Cases
- HTML5 `<video>` element captions
- YouTube subtitle uploads
- Web-based video players
- Accessible web content (WCAG compliance)

#### Example Output
```vtt
WEBVTT

00:00:00.080 --> 00:00:00.320
today

00:00:00.320 --> 00:00:00.640
we're going to enhance

00:00:00.640 --> 00:00:01.120
your VS Code

00:00:01.120 --> 00:00:01.600
to ensure that you've got

00:00:01.600 --> 00:00:02.080
the most efficient workspace
```

#### Key Features
- ✅ **WEBVTT header** (required first line)
- ✅ **Period separator** in timestamps (`HH:MM:SS.mmm`)
- ✅ **No sequence numbers** (cleaner format)
- ✅ **HTML entity encoding** (`&` → `&amp;`, `<` → `&lt;`)
- ✅ **W3C standard** with ongoing development
- ✅ **Styling support** (cue settings, CSS)

#### Pros & Cons

**Pros:**
- Official W3C web standard
- Smallest subtitle format (~127 KB, 56% smaller than JSON)
- Native browser support (HTML5 video)
- Supports styling and positioning
- YouTube-compatible
- Accessibility-friendly

**Cons:**
- Less universal than SRT in desktop software
- Styling features not always supported
- Header requirement (WEBVTT line)
- Newer standard (less tool support than SRT)

#### Compatibility
- ✅ All modern web browsers (Chrome, Firefox, Safari, Edge)
- ✅ YouTube subtitle uploads
- ✅ HTML5 `<video>` element
- ✅ Video.js and other web players
- ⚠️ Adobe Premiere Pro (limited support)
- ⚠️ Final Cut Pro (import as SRT instead)
- ✅ VLC Media Player

---

### CSV Format

Spreadsheet-compatible format with 7 columns for data analysis.

#### Use Cases
- Data analysis in Excel, Google Sheets, or LibreOffice
- Transcript statistics and metrics
- Importing into databases
- Python pandas or R data frames
- Bulk text processing workflows

#### Example Output
```csv
Sequence,Start,End,Duration,Text,Language,Source
1,00:00:00.080,00:00:00.320,00:00:00.240,today,en,youtube_api_manual
2,00:00:00.320,00:00:00.640,00:00:00.320,we're going to enhance,en,youtube_api_manual
3,00:00:00.640,00:00:01.120,00:00:00.480,your VS Code,en,youtube_api_manual
4,00:00:01.120,00:00:01.600,00:00:00.480,"to ensure that you've got",en,youtube_api_manual
5,00:00:01.600,00:00:02.080,00:00:00.480,the most efficient workspace,en,youtube_api_manual
```

#### Key Features
- ✅ **BOM (Byte Order Mark)** for Excel compatibility (`\uFEFF`)
- ✅ **7 columns**: Sequence, Start, End, Duration, Text, Language, Source
- ✅ **RFC 4180 compliant** escaping (quotes, commas, newlines)
- ✅ **Configurable timestamps** (seconds, HH:MM:SS, HH:MM:SS.mmm)
- ✅ **Calculated duration** column (End - Start)

#### Column Definitions

| Column | Description | Example |
|--------|-------------|---------|
| `Sequence` | Segment number (1-indexed) | `1` |
| `Start` | Start timestamp | `00:00:00.080` |
| `End` | End timestamp | `00:00:00.320` |
| `Duration` | Calculated duration (End - Start) | `00:00:00.240` |
| `Text` | Transcript text (escaped) | `"Hello, world"` |
| `Language` | Language code | `en` |
| `Source` | Caption source | `youtube_api_manual` |

#### Pros & Cons

**Pros:**
- Opens directly in Excel, Google Sheets
- Easy data analysis and statistics
- Filterable and sortable columns
- Standard format for data science
- Includes calculated duration
- Database-friendly import

**Cons:**
- Not usable in video editors
- Larger than VTT (~175 KB)
- Requires spreadsheet software
- Commas in text need escaping
- Not for casual reading

#### Compatibility
- ✅ Microsoft Excel (BOM ensures proper encoding)
- ✅ Google Sheets
- ✅ LibreOffice Calc
- ✅ Python pandas (`pd.read_csv()`)
- ✅ R data frames
- ✅ Database imports (MySQL, PostgreSQL)
- ✅ CSV parsers in all languages

---

### TXT Format (Plain Text)

Simple text format with **3 modes** for different use cases.

#### Use Cases
- Human reading and documentation
- Text extraction for search indexing
- Word counting and text analysis
- Blog posts or article transcripts
- Natural language processing (NLP)

#### Mode 1: Plain (Default)

Space-separated text for simple extraction.

```txt
today we're going to enhance your VS Code to ensure that you've got the most efficient workspace available at your fingertips
```

**Use for:** Word counting, search indexing, basic text analysis

#### Mode 2: Timestamped

One line per segment with timestamp prefix.

```txt
[00:00:00] today
[00:00:00] we're going to enhance
[00:00:00] your VS Code
[00:00:01] to ensure that you've got
[00:00:01] the most efficient workspace
```

**Use for:** Following along with video, finding specific moments

#### Mode 3: Paragraph

Groups segments by time gaps for natural reading.

```txt
today we're going to enhance your VS Code to ensure that you've got the most efficient workspace available at your fingertips

we'll cover the best settings and the themes that I personally use plus some of the most powerful extensions
```

**Use for:** Blog posts, documentation, natural reading flow

#### Key Features
- ✅ **3 modes**: plain, timestamped, paragraph
- ✅ **Smallest format** (~17.5 KB, **94% smaller than JSON!**)
- ✅ **Optional metadata** header (export date, language, segment count)
- ✅ **Configurable paragraph gaps** (default: 2.0 seconds)
- ✅ **Configurable timestamp formats** (HH:MM:SS, seconds, etc.)

#### Pros & Cons

**Pros:**
- Extremely small file size (94% reduction)
- Human-readable and editable
- Three modes for different needs
- No special software required
- Fast to generate and parse
- Perfect for NLP workflows

**Cons:**
- No timestamps in plain mode
- Not usable in video editors
- Loses metadata (language, source)
- Paragraph mode requires tuning gaps
- Not structured for programming

#### Compatibility
- ✅ All text editors (Notepad, VS Code, Vim, etc.)
- ✅ Word processors (Microsoft Word, Google Docs)
- ✅ Markdown processors
- ✅ Command-line tools (grep, sed, awk)
- ✅ NLP libraries (NLTK, spaCy)
- ❌ Video editing software (use SRT/VTT)

---

## Decision Tree: Which Format Should I Use?

### Start Here: What's your primary goal?

```
┌─ Video Editing / Subtitles
│  ├─ Desktop software (Premiere, Final Cut) → SRT
│  └─ Web/HTML5 video or YouTube → VTT
│
├─ Data Analysis / Programming
│  ├─ Spreadsheet analysis (Excel) → CSV
│  ├─ API integration / TypeScript → JSON
│  └─ Python data science → CSV or JSON
│
├─ Text Extraction / Reading
│  ├─ Word counting / indexing → TXT (plain mode)
│  ├─ Following along with video → TXT (timestamped mode)
│  ├─ Blog post / article → TXT (paragraph mode)
│  └─ Documentation → TXT (paragraph mode)
│
└─ File Size Matters
   ├─ Smallest possible → TXT (94% smaller)
   ├─ Balanced size + features → VTT (56% smaller)
   └─ Need all data → JSON (baseline)
```

### Quick Decision Table

| If you need... | Use this format |
|----------------|-----------------|
| Subtitles in Adobe Premiere Pro | **SRT** |
| Captions for HTML5 video | **VTT** |
| YouTube subtitle upload | **VTT** |
| Excel data analysis | **CSV** |
| API response / TypeScript | **JSON** |
| Text for word counting | **TXT** (plain) |
| Blog post transcript | **TXT** (paragraph) |
| Following along with video | **TXT** (timestamped) |
| Python pandas analysis | **CSV** |
| Natural language processing | **TXT** (plain) |
| Smallest file size | **TXT** |
| Complete structured data | **JSON** |

---

## Compatibility Matrix

### Video Editing Software

| Software | JSON | SRT | VTT | CSV | TXT |
|----------|------|-----|-----|-----|-----|
| Adobe Premiere Pro | ❌ | ✅ | ⚠️ | ❌ | ❌ |
| Final Cut Pro | ❌ | ✅ | ⚠️ | ❌ | ❌ |
| DaVinci Resolve | ❌ | ✅ | ❌ | ❌ | ❌ |
| iMovie | ❌ | ✅ | ❌ | ❌ | ❌ |
| Camtasia | ❌ | ✅ | ✅ | ❌ | ❌ |

### Web Browsers & Players

| Platform | JSON | SRT | VTT | CSV | TXT |
|----------|------|-----|-----|-----|-----|
| Chrome/Edge (HTML5) | ⚠️ | ⚠️ | ✅ | ❌ | ❌ |
| Firefox (HTML5) | ⚠️ | ⚠️ | ✅ | ❌ | ❌ |
| Safari (HTML5) | ⚠️ | ⚠️ | ✅ | ❌ | ❌ |
| YouTube Upload | ❌ | ✅ | ✅ | ❌ | ❌ |
| VLC Media Player | ❌ | ✅ | ✅ | ❌ | ❌ |
| Video.js | ⚠️ | ✅ | ✅ | ❌ | ❌ |

### Data Analysis Tools

| Tool | JSON | SRT | VTT | CSV | TXT |
|------|------|-----|-----|-----|-----|
| Microsoft Excel | ⚠️ | ❌ | ❌ | ✅ | ⚠️ |
| Google Sheets | ⚠️ | ❌ | ❌ | ✅ | ⚠️ |
| Python pandas | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| R / tidyverse | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ |
| jq (JSON processor) | ✅ | ❌ | ❌ | ❌ | ❌ |

### Programming Languages

| Language | JSON | SRT | VTT | CSV | TXT |
|----------|------|-----|-----|-----|-----|
| TypeScript/JavaScript | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Python | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| Java | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| C# | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Go | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

**Legend:**
- ✅ Native support / Best choice
- ⚠️ Requires parsing / Possible with libraries
- ❌ Not compatible / Not recommended

---

## Size Comparison

Based on real test data from a 15-minute video (3,624 segments):

| Format | File Size | vs JSON | Best For |
|--------|-----------|---------|----------|
| **JSON** | 289.71 KB | Baseline (100%) | Complete structured data |
| **SRT** | 143.82 KB | **50% smaller** | Video editing (desktop) |
| **VTT** | 127.22 KB | **56% smaller** | Web captions (smallest subtitle format) |
| **CSV** | 174.69 KB | **40% smaller** | Spreadsheet analysis |
| **TXT** | 17.50 KB | **94% smaller** | Text extraction (dramatically smallest!) |

### Size Analysis

- **TXT format is the clear winner** for size reduction (94% smaller)
- **VTT is the best subtitle format** for size (56% smaller than JSON, 12% smaller than SRT)
- **CSV includes extra columns** (duration, language, source) but still 40% smaller than JSON
- **SRT and VTT** have similar sizes, both much smaller than JSON
- **JSON overhead** comes from property names and structure, but provides complete data

### Recommendations by Constraint

| Constraint | Recommended Format | Reasoning |
|------------|-------------------|-----------|
| **Minimal bandwidth** | TXT (plain mode) | 94% size reduction |
| **Subtitles + small size** | VTT | 56% smaller, web-standard |
| **Balance data + size** | CSV | 40% smaller, all metadata preserved |
| **No size constraint** | JSON | Complete structure, type-safe |

---

## Official Specifications

### Format Standards

- **JSON**: [RFC 8259 - The JavaScript Object Notation (JSON) Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259.html)
- **SRT (SubRip)**: [SubRip on Wikipedia](https://en.wikipedia.org/wiki/SubRip) (de facto standard, no official RFC)
- **VTT (WebVTT)**: [W3C WebVTT: The Web Video Text Tracks Format](https://www.w3.org/TR/webvtt1/)
- **CSV**: [RFC 4180 - Common Format and MIME Type for CSV Files](https://www.rfc-editor.org/rfc/rfc4180.html)
- **TXT**: Plain text format (UTF-8 encoding)

### Related Standards

- **ISO 8601**: Date and time format (used in metadata timestamps)
- **UTF-8**: [RFC 3629 - UTF-8, a transformation format of ISO 10646](https://www.rfc-editor.org/rfc/rfc3629.html)
- **HTML5 Video**: [WHATWG HTML Living Standard - Video](https://html.spec.whatwg.org/multipage/media.html#the-video-element)
- **WCAG 2.1**: [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG21/) (captions and subtitles)

### Browser Support

- **WebVTT Browser Support**: [Can I Use - WebVTT](https://caniuse.com/webvtt)
- **Track Element**: [Can I Use - Track Element](https://caniuse.com/video)

### MIME Types

Register these MIME types when serving files over HTTP:

```http
Content-Type: application/json; charset=utf-8          # JSON
Content-Type: text/srt; charset=utf-8                  # SRT
Content-Type: text/vtt; charset=utf-8                  # VTT
Content-Type: text/csv; charset=utf-8                  # CSV
Content-Type: text/plain; charset=utf-8                # TXT
```

---

## Advanced Usage

### Combining Formats

You can request multiple formats for different purposes:

```typescript
// Get JSON for programming
const jsonData = await get_timed_transcript({ url, format: 'json' });

// Get SRT for video editing
const srtContent = await get_timed_transcript({ url, format: 'srt' });

// Get TXT for documentation
const txtContent = await get_timed_transcript({ url, format: 'txt' });
```

### Format Conversion

The MCP server handles format conversion automatically:

1. **Fetches transcript** from YouTube (once)
2. **Caches segments** in memory
3. **Converts to requested format** on-the-fly
4. **Returns formatted output**

This means multiple format requests for the same video are efficient.

### Custom Options

Some formats support customization (see TypeScript types):

```typescript
// CSV with different timestamp format
const csv = await get_timed_transcript({ 
    url, 
    format: 'csv',
    // Note: Options not yet exposed in MCP schema, coming soon
});

// TXT with paragraph mode
const txt = await get_timed_transcript({ 
    url, 
    format: 'txt',
    // Note: Options not yet exposed in MCP schema, coming soon
});
```

---

## Troubleshooting

### Common Issues

**Problem:** Excel shows garbled characters  
**Solution:** CSV format includes BOM (`\uFEFF`) for Excel. If issues persist, open with "Import Data" and select UTF-8 encoding.

**Problem:** Video editor won't import SRT  
**Solution:** Ensure file has `.srt` extension. Some editors are strict about extension.

**Problem:** VTT doesn't display in browser  
**Solution:** Ensure file starts with `WEBVTT` line and is served with correct MIME type (`text/vtt`).

**Problem:** JSON too large for API response  
**Solution:** Use TXT format (94% smaller) or paginate the response.

**Problem:** Paragraph mode creates too many/few paragraphs  
**Solution:** Adjust `paragraphGap` option (default: 2.0 seconds). Increase for fewer paragraphs, decrease for more.

---

## Contributing

Found an issue with a format? Want to suggest improvements?

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/thisis-romar/tools-repository/issues)
- **Format Specification**: See implementation in `src/formatters/`
- **Tests**: Run `npm test` to verify format compliance

---

## License

This documentation is part of MCP YouTube Transcript Pro.

**Last Updated:** October 17, 2025  
**Version:** 1.0.0
