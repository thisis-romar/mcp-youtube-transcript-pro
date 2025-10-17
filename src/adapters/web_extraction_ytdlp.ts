import { TranscriptSegment } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

// JSON3 format interfaces
interface JSON3Segment {
    utf8: string;
    tOffsetMs?: number;
    acAsrConf?: number;
}

interface JSON3Event {
    tStartMs: number;
    dDurationMs: number;
    wWinId?: number;
    segs?: JSON3Segment[];
}

interface JSON3Format {
    events: JSON3Event[];
}

/**
 * Find yt-dlp executable path
 */
async function findYtDlp(): Promise<string> {
    // Common installation paths
    const possiblePaths = [
        // Winget installation path
        path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages'),
        // User local bin
        path.join(process.env.USERPROFILE || '', '.local', 'bin'),
        // System path (will be found by 'yt-dlp' command if in PATH)
        'yt-dlp'
    ];
    
    // Try to find yt-dlp in winget packages first
    if (possiblePaths[0]) {
        try {
            const { stdout } = await execAsync(`powershell "Get-ChildItem -Path '${possiblePaths[0]}' -Recurse -Filter 'yt-dlp.exe' | Select-Object -First 1 -ExpandProperty FullName"`);
            const foundPath = stdout.trim();
            if (foundPath) {
                return foundPath;
            }
        } catch {
            // Continue to next method
        }
    }
    
    // Fall back to assuming it's in PATH
    return 'yt-dlp';
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Parse JSON3 format into TranscriptSegment array
 */
function parseJSON3(json3Data: JSON3Format): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    
    for (const event of json3Data.events) {
        if (!event.segs || event.segs.length === 0) continue;
        
        let currentTimeMs = event.tStartMs;
        let currentText = '';
        
        for (let i = 0; i < event.segs.length; i++) {
            const seg = event.segs[i];
            const nextSeg = event.segs[i + 1];
            
            // Add segment text
            currentText += seg.utf8;
            
            // Calculate timing
            const segStartMs = currentTimeMs;
            const segOffsetMs = seg.tOffsetMs || 0;
            const nextOffsetMs = nextSeg?.tOffsetMs || event.dDurationMs;
            const segDurationMs = nextOffsetMs - segOffsetMs;
            
            currentTimeMs += segOffsetMs;
            
            // Create segment
            segments.push({
                start: segStartMs / 1000,
                end: (segStartMs + segDurationMs) / 1000,
                text: seg.utf8.trim(),
                lang: 'en', // Language from yt-dlp parameters
                source: 'web_extraction'
            });
        }
    }
    
    return segments;
}

/**
 * Download YouTube transcript using yt-dlp
 */
export async function getYouTubeTranscript(videoUrl: string, language: string = 'en'): Promise<TranscriptSegment[]> {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }
    
    // Find yt-dlp
    const ytDlpPath = await findYtDlp();
    
    // Create temporary directory for output
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yt-transcript-'));
    const outputTemplate = path.join(tempDir, 'subtitle');
    
    try {
        // Download subtitles in JSON3 format
        const command = `"${ytDlpPath}" --write-subs --write-auto-subs --skip-download --sub-lang ${language} --sub-format json3 -o "${outputTemplate}" "${videoUrl}"`;
        
        await execAsync(command, {
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large transcripts
        });
        
        // Read the generated JSON3 file
        const json3File = `${outputTemplate}.${language}.json3`;
        const json3Content = await fs.readFile(json3File, 'utf-8');
        const json3Data: JSON3Format = JSON.parse(json3Content);
        
        // Parse into our format
        const segments = parseJSON3(json3Data);
        
        // Cleanup temp directory
        await fs.rm(tempDir, { recursive: true, force: true });
        
        return segments;
        
    } catch (error) {
        // Cleanup on error
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
        
        const err = error as Error;
        throw new Error(`Failed to extract transcript: ${err.message}`);
    }
}
