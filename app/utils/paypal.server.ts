import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// PayPal API URLs
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Log environment variables for debugging
console.log('PayPal Server Initialization:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PAYPAL_CLIENT_ID exists:', !!process.env.PAYPAL_CLIENT_ID);
console.log('PAYPAL_CLIENT_SECRET exists:', !!process.env.PAYPAL_CLIENT_SECRET);
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  console.log('ID and Secret are identical:', process.env.PAYPAL_CLIENT_ID === process.env.PAYPAL_CLIENT_SECRET);
  console.log('ID first 4 chars:', process.env.PAYPAL_CLIENT_ID.substring(0, 4));
  console.log('Secret first 4 chars:', process.env.PAYPAL_CLIENT_SECRET.substring(0, 4));
}

// Mock successful refund response for development when credentials are missing
const mockRefundResponse = {
  id: 'MOCK_REFUND_' + Date.now(),
  status: 'COMPLETED',
  amount: {
    value: '0.00',
    currency_code: 'EUR'
  },
  create_time: new Date().toISOString(),
  update_time: new Date().toISOString()
};

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  // Ensure we have the latest environment variables
  dotenv.config();
  
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  // Log the actual values for debugging
  console.log('getAccessToken called with:');
  console.log('- clientId length:', clientId?.length);
  console.log('- clientSecret length:', clientSecret?.length);
  console.log('- Are identical:', clientId === clientSecret);
  
  // More detailed validation of credentials
  if (!clientId) {
    throw new Error('PayPal Client ID is missing. Please check your environment variables.');
  }

  if (!clientSecret) {
    throw new Error('PayPal Client Secret is missing. Please check your environment variables.');
  }

  // Check if client ID and secret are identical (common mistake)
  if (clientId === clientSecret) {
    console.warn('WARNING: PayPal Client ID and Client Secret are identical. This is likely incorrect.');
    console.warn('ID:', clientId);
    console.warn('Secret:', clientSecret);
    
    // Try to clean up quotes if present (sometimes an issue with .env parsing)
    const cleanId = clientId.replace(/^['"]|['"]$/g, '');
    const cleanSecret = clientSecret.replace(/^['"]|['"]$/g, '');
    
    if (cleanId !== clientId || cleanSecret !== clientSecret) {
      console.log('Attempting to use cleaned credentials (quotes removed)');
      return getAccessTokenWithCredentials(cleanId, cleanSecret);
    }
  }

  return getAccessTokenWithCredentials(clientId, clientSecret);
}

// Helper function to get access token with specific credentials
async function getAccessTokenWithCredentials(clientId: string, clientSecret: string): Promise<string> {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    const responseText = await response.text();
    
    // Try to parse as JSON, but keep the original text in case of error
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse PayPal response: ${responseText}`);
    }

    if (!response.ok) {
      // Log more details about the error
      console.error('PayPal authentication error details:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Provide a more specific error message based on the error type
      if (data.error === 'invalid_client') {
        throw new Error('PayPal authentication failed: Invalid client credentials. Please check your Client ID and Secret.');
      } else {
        throw new Error(`PayPal authentication failed: ${data.error_description || JSON.stringify(data)}`);
      }
    }

    if (!data.access_token) {
      throw new Error(`PayPal response missing access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
  } catch (error) {
    // Catch network errors or other unexpected issues
    if (error instanceof Error) {
      console.error('PayPal authentication error:', error.message);
      throw error;
    }
    throw new Error(`Unknown error during PayPal authentication: ${String(error)}`);
  }
}

// Define the return type for the refund function
interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
  mockResponse?: boolean;
}

// Process a refund for a PayPal payment
export async function refundPayPalPayment(
  transactionId: string,
  amount: number,
  reason: string
): Promise<RefundResult> {
  try {
    if (!transactionId) {
      return {
        success: false,
        error: 'Missing transaction ID for refund'
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: `Invalid refund amount: ${amount}`
      };
    }

    console.log(`Attempting to refund PayPal transaction ${transactionId} for €${amount.toFixed(2)}`);
    
    // In development mode, if credentials are missing or invalid, use mock response
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Try to get access token to test credentials
        await getAccessToken();
      } catch (error) {
        console.warn('Using mock refund response due to PayPal credential issues:', error instanceof Error ? error.message : String(error));
        
        return {
          success: true,
          refundId: mockRefundResponse.id,
          mockResponse: true
        };
      }
    }
    
    // Get access token
    const accessToken = await getAccessToken();

    // Call PayPal refund API
    const response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${transactionId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency_code: 'EUR'
        },
        note_to_payer: reason
      })
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      return {
        success: false,
        error: `Failed to parse PayPal refund response: ${responseText}`
      };
    }

    if (!response.ok) {
      console.error('PayPal refund error details:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      
      return {
        success: false,
        error: `PayPal refund failed: ${responseData.message || responseData.error?.message || JSON.stringify(responseData)}`
      };
    }

    console.log('PayPal refund successful:', responseData);
    
    return {
      success: true,
      refundId: responseData.id
    };
  } catch (error) {
    console.error('Error processing PayPal refund:', error);
    
    // In development mode, return a mock successful response if there's an error
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock refund response due to error in development mode');
      return {
        success: true,
        refundId: mockRefundResponse.id,
        mockResponse: true
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing refund'
    };
  }
}

// Get details of a PayPal transaction
export async function getPayPalTransactionDetails(transactionId: string) {
  try {
    if (!transactionId) {
      throw new Error('Missing transaction ID');
    }
    
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse PayPal transaction details response: ${responseText}`);
    }

    if (!response.ok) {
      console.error('PayPal transaction details error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(`Failed to get transaction details: ${data.message || JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting PayPal transaction details:', error);
    throw error;
  }
} 