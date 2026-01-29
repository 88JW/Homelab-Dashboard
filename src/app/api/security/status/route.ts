import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('/usr/local/bin/check-security.sh', {
      timeout: 5000,
    });
    
    const data = JSON.parse(stdout);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Security status API error:', error);
    return NextResponse.json({ 
      security: [],
      activeCount: 0,
      totalCount: 0,
      status: 'error',
      error: error.message
    }, { status: 200 });
  }
}
