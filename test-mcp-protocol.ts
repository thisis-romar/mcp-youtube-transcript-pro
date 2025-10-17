/**
 * Test the MCP JSON-RPC protocol implementation
 * 
 * This simulates an MCP client sending JSON-RPC requests to the server via stdin
 * and verifies the responses on stdout.
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

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

class MCPClient {
    private process: ChildProcess;
    private buffer: string = '';
    private pendingRequests: Map<number, {
        resolve: (response: JsonRpcResponse) => void;
        reject: (error: Error) => void;
    }> = new Map();
    private nextId = 1;

    constructor() {
        // Start the MCP server
        const serverPath = path.join(__dirname, 'dist', 'index.js');
        this.process = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env }
        });

        // Handle stdout (JSON-RPC responses)
        this.process.stdout?.on('data', (data: Buffer) => {
            this.buffer += data.toString();
            this.processBuffer();
        });

        // Handle stderr (server logs)
        this.process.stderr?.on('data', (data: Buffer) => {
            console.log('[Server]', data.toString().trim());
        });

        // Handle process exit
        this.process.on('exit', (code) => {
            console.log(`[Server] Process exited with code ${code}`);
        });
    }

    private processBuffer() {
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const response: JsonRpcResponse = JSON.parse(line);
                    const id = response.id as number;
                    const pending = this.pendingRequests.get(id);
                    if (pending) {
                        this.pendingRequests.delete(id);
                        if (response.error) {
                            pending.reject(new Error(response.error.message));
                        } else {
                            pending.resolve(response);
                        }
                    }
                } catch (error) {
                    console.error('[Client] Failed to parse response:', line);
                }
            }
        }
    }

    async sendRequest(method: string, params?: any): Promise<any> {
        const id = this.nextId++;
        const request = {
            jsonrpc: '2.0' as const,
            method,
            params,
            id
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject });
            this.process.stdin?.write(JSON.stringify(request) + '\n');

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error(`Request timeout: ${method}`));
                }
            }, 30000);
        });
    }

    close() {
        this.process.kill();
    }
}

async function runMCPProtocolTests() {
    console.log('=== MCP JSON-RPC Protocol Tests ===\n');

    const client = new MCPClient();

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Test 1: Initialize
        console.log('Test 1: initialize');
        console.log('-'.repeat(50));
        const initResponse = await client.sendRequest('initialize');
        console.log('Protocol Version:', initResponse.result.protocolVersion);
        console.log('Server Name:', initResponse.result.serverInfo.name);
        console.log('Server Version:', initResponse.result.serverInfo.version);
        console.log('✅ initialize passed\n');

        // Test 2: List tools
        console.log('Test 2: tools/list');
        console.log('-'.repeat(50));
        const listResponse = await client.sendRequest('tools/list');
        const tools = listResponse.result.tools;
        console.log(`Found ${tools.length} tools:`);
        tools.forEach((tool: any) => {
            console.log(`  - ${tool.name}: ${tool.description}`);
        });
        console.log('✅ tools/list passed\n');

        // Test 3: Call get_video_info tool
        console.log('Test 3: tools/call (get_video_info)');
        console.log('-'.repeat(50));
        const videoInfoResponse = await client.sendRequest('tools/call', {
            name: 'get_video_info',
            arguments: {
                url: 'https://www.youtube.com/watch?v=lxRAj1Gijic'
            }
        });
        const videoInfo = JSON.parse(videoInfoResponse.result.content[0].text);
        console.log('Title:', videoInfo.title);
        console.log('Channel ID:', videoInfo.channelId);
        console.log('Duration:', videoInfo.duration);
        console.log('✅ tools/call (get_video_info) passed\n');

        // Test 4: Call list_tracks tool
        console.log('Test 4: tools/call (list_tracks)');
        console.log('-'.repeat(50));
        const tracksResponse = await client.sendRequest('tools/call', {
            name: 'list_tracks',
            arguments: {
                url: 'https://www.youtube.com/watch?v=lxRAj1Gijic'
            }
        });
        const tracks = JSON.parse(tracksResponse.result.content[0].text);
        console.log(`Found ${tracks.length} caption track(s):`);
        tracks.forEach((track: any, i: number) => {
            console.log(`  ${i + 1}. Language: ${track.lang}, Source: ${track.source}`);
        });
        console.log('✅ tools/call (list_tracks) passed\n');

        // Test 5: Call get_timed_transcript tool
        console.log('Test 5: tools/call (get_timed_transcript)');
        console.log('-'.repeat(50));
        const timedResponse = await client.sendRequest('tools/call', {
            name: 'get_timed_transcript',
            arguments: {
                url: 'lxRAj1Gijic'  // Test with just video ID
            }
        });
        const segments = JSON.parse(timedResponse.result.content[0].text);
        console.log(`Total segments: ${segments.length}`);
        console.log(`First: [${segments[0].start}s - ${segments[0].end}s] "${segments[0].text}"`);
        console.log('✅ tools/call (get_timed_transcript) passed\n');

        // Test 6: Call get_transcript tool
        console.log('Test 6: tools/call (get_transcript)');
        console.log('-'.repeat(50));
        const transcriptResponse = await client.sendRequest('tools/call', {
            name: 'get_transcript',
            arguments: {
                url: 'https://www.youtube.com/watch?v=lxRAj1Gijic'
            }
        });
        const plainText = transcriptResponse.result.content[0].text;
        const wordCount = plainText.split(' ').length;
        console.log(`Transcript length: ${plainText.length} characters`);
        console.log(`Word count: ${wordCount} words`);
        console.log(`Preview: "${plainText.substring(0, 100)}..."`);
        console.log('✅ tools/call (get_transcript) passed\n');

        // Test 7: Ping
        console.log('Test 7: ping');
        console.log('-'.repeat(50));
        const pingResponse = await client.sendRequest('ping');
        console.log('Ping successful:', JSON.stringify(pingResponse.result));
        console.log('✅ ping passed\n');

        // Summary
        console.log('='.repeat(50));
        console.log('✅ All MCP protocol tests passed successfully!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

runMCPProtocolTests();
