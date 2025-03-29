import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    // Test API connectivity with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a test response. Reply with 'OpenAI API is working correctly!'"
        }
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: completion.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 