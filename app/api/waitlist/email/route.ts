import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { WaitlistEntry } from '@/app/lib/types';
import { EmailService } from '@/app/lib/email-service';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'waitlist.json');

// Helper to read waitlist entries (reused from route.ts)
async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// POST handler for sending bulk emails
export async function POST(request: Request) {
  // In a production app, verify authentication/authorization here
  // This endpoint should only be accessible to admins
  
  try {
    const { ids, subject, message } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0 || !subject || !message) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Get entries matching the provided IDs
    const allEntries = await getWaitlistEntries();
    const targetEntries = allEntries.filter(entry => ids.includes(entry.id));
    
    if (targetEntries.length === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found' },
        { status: 400 }
      );
    }
    
    // Send the emails
    const results = await EmailService.sendBulkEmail(targetEntries, subject, message);
    
    // Return results
    return NextResponse.json({
      success: true,
      sent: results.success.length,
      failed: results.failed.length,
      results
    });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk email' },
      { status: 500 }
    );
  }
} 