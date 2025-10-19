#!/usr/bin/env node

/**
 * MCP YouTube Transcript Server
 * 
 * Model Context Protocol (MCP) compliant server for fetching YouTube transcripts.
 * Implements JSON-RPC 2.0 over stdio.
 */

import * as readline from 'readline';
import { list_tracks, get_transcript, get_timed_transcript, get_video_info } from './tools';
import { ToolInput } from './types';

// JSON-RPC 2.0 Types
interface JsonRpcRequest {
    jsonrpc: '2.0';
    method: string;
    params?: any;
    id?: string | number;
}

interface JsonRpcResponse {
    jsonrpc: '2.0';
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: string | number | null;
}

// MCP Server Information
const SERVER_INFO = {
    name: 'mcp-youtube-transcript-pro',
    version: '1.1.0',
    description: 'MCP server for fetching YouTube video transcripts with metadata',
    tools: [
        {
            name: 'list_tracks',
            description: 'Lists available caption tracks for a YouTube video',
            inputSchema: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'YouTube video URL or video ID'
                    }
                },
                required: ['url']
            }
        },
        {
            name: 'get_transcript',
            description: 'Returns a merged plain text transcript',
            inputSchema: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'YouTube video URL or video ID'
                    },
                    lang: {
                        type: 'string',
                        description: 'Language code (default: en)',
                        default: 'en'
                    }
                },
                required: ['url']
            }
        },
        {
            name: 'get_timed_transcript',
            description: 'Returns timestamped transcript segments in multiple formats (JSON, SRT, VTT, CSV, TXT) with optional preprocessing',
            inputSchema: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'YouTube video URL or video ID'
                    },
                    lang: {
                        type: 'string',
                        description: 'Language code (default: en)',
                        default: 'en'
                    },
                    format: {
                        type: 'string',
                        description: "Output format (default: json). Options: 'json' (structured data), 'srt' (SubRip subtitles), 'vtt' (WebVTT captions), 'csv' (spreadsheet), 'txt' (plain text)",
                        enum: ['json', 'srt', 'vtt', 'csv', 'txt'],
                        default: 'json'
                    },
                    filterEmpty: {
                        type: 'boolean',
                        description: 'Remove segments with empty or whitespace-only text (default: false). Useful for cleaning auto-generated captions.',
                        default: false
                    },
                    mergeOverlaps: {
                        type: 'boolean',
                        description: 'Merge segments with overlapping timestamps (default: false). Useful for fixing word-level timing issues in auto-generated captions.',
                        default: false
                    },
                    removeSilence: {
                        type: 'boolean',
                        description: 'Remove silence markers like [silence], [pause], [Music] (default: false). More aggressive than filterEmpty.',
                        default: false
                    },
                    outputFile: {
                        type: 'string',
                        description: 'Optional file path to write formatted output. If provided, writes content to file and returns success message instead of content. Supports absolute and relative paths. Parent directories are created automatically. Prevents conversation context overflow with large transcript files (200KB+).'
                    },
                    preview: {
                        oneOf: [
                            { type: 'boolean' },
                            { type: 'number', minimum: 1 }
                        ],
                        description: 'Truncate response to prevent context overflow. Use true for default 5000 character limit, or specify custom character limit. For JSON format, returns structured preview object. For text formats, returns truncated string with omission message. Works independently or combined with outputFile (file gets full content, conversation gets preview).'
                    }
                },
                required: ['url']
            }
        },
        {
            name: 'get_video_info',
            description: 'Returns video metadata including title, channel, duration, and available captions',
            inputSchema: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'YouTube video URL or video ID'
                    }
                },
                required: ['url']
            }
        }
    ]
};

// Error codes (JSON-RPC 2.0 standard)
const ErrorCodes = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603
};

/**
 * Send JSON-RPC response to stdout
 */
function sendResponse(response: JsonRpcResponse): void {
    console.log(JSON.stringify(response));
}

/**
 * Handle MCP initialize request
 */
async function handleInitialize(): Promise<any> {
    return {
        protocolVersion: '2025-06-18',
        serverInfo: {
            name: SERVER_INFO.name,
            version: SERVER_INFO.version
        },
        capabilities: {
            tools: {}
        }
    };
}

/**
 * Handle MCP tools/list request
 */
async function handleToolsList(): Promise<any> {
    return {
        tools: SERVER_INFO.tools
    };
}

/**
 * Handle MCP tools/call request
 */
async function handleToolsCall(params: any): Promise<any> {
    const { name, arguments: args } = params;
    
    if (!name || !args) {
        throw {
            code: ErrorCodes.INVALID_PARAMS,
            message: 'Missing required parameters: name and arguments'
        };
    }
    
    const input: ToolInput = {
        url: args.url,
        lang: args.lang,
        // Optional fields (used by get_timed_transcript)
        format: args.format,
        filterEmpty: args.filterEmpty,
        mergeOverlaps: args.mergeOverlaps,
        removeSilence: args.removeSilence,
        outputFile: args.outputFile,
        preview: args.preview
    };
    
    // Validate required input
    if (!input.url) {
        throw {
            code: ErrorCodes.INVALID_PARAMS,
            message: 'Missing required parameter: url'
        };
    }
    
    // Route to appropriate tool
    let result: any;
    switch (name) {
        case 'list_tracks':
            result = await list_tracks(input);
            break;
        case 'get_transcript':
            result = await get_transcript(input);
            break;
        case 'get_timed_transcript':
            result = await get_timed_transcript(input);
            break;
        case 'get_video_info':
            result = await get_video_info(input);
            break;
        default:
            throw {
                code: ErrorCodes.METHOD_NOT_FOUND,
                message: `Unknown tool: ${name}`
            };
    }
    
    return {
        content: [
            {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
        ]
    };
}

/**
 * Handle incoming JSON-RPC request
 */
async function handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id ?? null
    };
    
    try {
        // Handle different MCP methods
        switch (request.method) {
            case 'initialize':
                response.result = await handleInitialize();
                break;
            case 'tools/list':
                response.result = await handleToolsList();
                break;
            case 'tools/call':
                response.result = await handleToolsCall(request.params);
                break;
            case 'ping':
                response.result = {};
                break;
            default:
                throw {
                    code: ErrorCodes.METHOD_NOT_FOUND,
                    message: `Method not found: ${request.method}`
                };
        }
    } catch (error: any) {
        // Handle errors
        if (error.code && error.message) {
            // Already formatted error
            response.error = error;
        } else if (error instanceof Error) {
            // Standard Error object
            response.error = {
                code: ErrorCodes.INTERNAL_ERROR,
                message: error.message,
                data: { stack: error.stack }
            };
        } else {
            // Unknown error
            response.error = {
                code: ErrorCodes.INTERNAL_ERROR,
                message: String(error)
            };
        }
    }
    
    return response;
}

/**
 * Main server loop
 */
async function main(): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    
    // Log to stderr for debugging (stdout is reserved for JSON-RPC)
    console.error('MCP YouTube Transcript Server started');
    console.error(`Version: ${SERVER_INFO.version}`);
    console.error('Listening for JSON-RPC requests on stdin...\n');
    
    rl.on('line', async (line: string) => {
        try {
            // Parse JSON-RPC request
            const request: JsonRpcRequest = JSON.parse(line);
            
            // Validate JSON-RPC 2.0 format
            if (request.jsonrpc !== '2.0') {
                sendResponse({
                    jsonrpc: '2.0',
                    error: {
                        code: ErrorCodes.INVALID_REQUEST,
                        message: 'Invalid JSON-RPC version (must be 2.0)'
                    },
                    id: null
                });
                return;
            }
            
            // Handle request
            const response = await handleRequest(request);
            sendResponse(response);
            
        } catch (error) {
            // Parse error
            sendResponse({
                jsonrpc: '2.0',
                error: {
                    code: ErrorCodes.PARSE_ERROR,
                    message: 'Parse error',
                    data: { error: String(error) }
                },
                id: null
            });
        }
    });
    
    rl.on('close', () => {
        console.error('MCP server shutting down...');
        process.exit(0);
    });
}

// Start the server
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
