import { NextResponse } from 'next/server';
import axios from 'axios';

// Fallback keys for development ONLY
const FALLBACK_SPEECH_KEY = "d11e1f0a2b6643a0affd17bb0839f4aa";
const FALLBACK_REGION = "eastus";

export async function GET() {
  try {
    // Get Azure Speech API credentials from environment variables
    const subscriptionKey = process.env.AZURE_SPEECH_KEY || 
                           process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || 
                           FALLBACK_SPEECH_KEY;
    
    const region = process.env.AZURE_SPEECH_REGION || 
                  process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 
                  FALLBACK_REGION;
    
    console.log("Generating speech token with region:", region);
    
    // Generate token from Azure Speech Services
    const url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const response = await axios.post(
      url,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return token and region
    return NextResponse.json({
      token: response.data,
      region: region
    });
  } catch (error: any) {
    console.error('Error generating speech token:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to generate speech token' },
      { status: 500 }
    );
  }
} 