import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { WaitlistEntry } from '@/app/lib/types';
import { EmailService } from '@/app/lib/email-service';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'waitlist.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read all waitlist entries
async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    await ensureDataDirectory();
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

// Save waitlist entries
async function saveWaitlistEntries(entries: WaitlistEntry[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(entries, null, 2));
}

// GET handler for listing waitlist entries (protected, admin only)
export async function GET(request: Request) {
  // Here you would check authentication and authorization
  // This is a simplified example - in production, implement proper auth checks
  
  try {
    const entries = await getWaitlistEntries();
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist entries' },
      { status: 500 }
    );
  }
}

// POST handler for adding a new waitlist entry
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.fullName || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Create new waitlist entry
    const newEntry: WaitlistEntry = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || undefined,
      joinedDate: new Date().toISOString(),
      status: 'pending',
      source: data.source || 'website',
    };
    
    // Get existing entries and add the new one
    const entries = await getWaitlistEntries();
    
    // Check if email already exists
    const emailExists = entries.some(entry => entry.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      );
    }
    
    entries.push(newEntry);
    
    // Save updated entries
    await saveWaitlistEntries(entries);
    
    // Send confirmation email
    try {
      await EmailService.sendWaitlistConfirmation(newEntry);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue anyway - the user is on the waitlist, email sending is secondary
    }
    
    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error('Error adding waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to add waitlist entry' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing waitlist entries (protected, admin only)
export async function DELETE(request: Request) {
  // Here you would check authentication and authorization
  
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No valid IDs provided' },
        { status: 400 }
      );
    }
    
    const entries = await getWaitlistEntries();
    const filteredEntries = entries.filter(entry => !ids.includes(entry.id));
    
    await saveWaitlistEntries(filteredEntries);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entries' },
      { status: 500 }
    );
  }
}

// PATCH handler for updating waitlist entry status (protected, admin only)
export async function PATCH(request: Request) {
  // Here you would check authentication and authorization
  
  try {
    const { ids, status } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    const entries = await getWaitlistEntries();
    const updatedEntries = entries.map(entry => {
      if (ids.includes(entry.id)) {
        return { ...entry, status };
      }
      return entry;
    });
    
    // Get entries that were updated
    const targetEntries = entries.filter(entry => ids.includes(entry.id));
    
    await saveWaitlistEntries(updatedEntries);
    
    // If status is 'notified', send emails to the users
    if (status === 'notified' && targetEntries.length > 0) {
      try {
        const emailResults = await EmailService.sendAccessNotification(targetEntries);
        return NextResponse.json({ 
          success: true,
          emailResults
        });
      } catch (emailError) {
        console.error('Error sending notification emails:', emailError);
        return NextResponse.json({ 
          success: true,
          warning: 'Entries were updated but there was an error sending emails'
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating waitlist entries:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entries' },
      { status: 500 }
    );
  }
} 