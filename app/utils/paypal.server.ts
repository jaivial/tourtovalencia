import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// PayPal API URLs
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.sandbox.paypal.com'
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

    console.log(`Attempting to refund PayPal transaction ${transactionId} for ${amount.toFixed(2)}€`);
    
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

    // First, try to get transaction details to verify it's refundable
    let transactionDetails;
    let captureId = transactionId; // Default to using the provided transaction ID
    
    try {
      transactionDetails = await getPayPalTransactionDetails(transactionId);
      console.log('Transaction details before refund:', {
        id: transactionDetails.id,
        status: transactionDetails.status,
        amount: transactionDetails.amount,
        create_time: transactionDetails.create_time,
        update_time: transactionDetails.update_time,
        links: transactionDetails.links
      });
      
      // If this is an order, we need to extract the capture ID
      if (transactionDetails.intent === 'CAPTURE' || transactionDetails.purchase_units) {
        console.log('Transaction appears to be an order. Attempting to extract capture ID...');
        
        // Try to extract capture ID from purchase units
        if (transactionDetails.purchase_units && Array.isArray(transactionDetails.purchase_units)) {
          for (const unit of transactionDetails.purchase_units) {
            if (unit.payments && unit.payments.captures && Array.isArray(unit.payments.captures) && unit.payments.captures.length > 0) {
              captureId = unit.payments.captures[0].id;
              console.log(`Found capture ID in order: ${captureId}`);
              break;
            }
          }
        }
        
        // If we couldn't find a capture ID, try to get more detailed order information
        if (captureId === transactionId) {
          console.log('No capture ID found in initial order details. Fetching detailed order information...');
          
          try {
            const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${transactionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              }
            });
            
            if (orderResponse.ok) {
              const orderDetails = await orderResponse.json();
              console.log('Detailed order information:', JSON.stringify(orderDetails, null, 2));
              
              // Extract capture ID from detailed order information
              if (orderDetails.purchase_units && Array.isArray(orderDetails.purchase_units)) {
                for (const unit of orderDetails.purchase_units) {
                  if (unit.payments && unit.payments.captures && Array.isArray(unit.payments.captures) && unit.payments.captures.length > 0) {
                    captureId = unit.payments.captures[0].id;
                    console.log(`Found capture ID in detailed order: ${captureId}`);
                    break;
                  }
                }
              }
            }
          } catch (orderError) {
            console.warn('Error fetching detailed order information:', orderError);
          }
        }
      }
      
      // Check if transaction is in a refundable state
      if (transactionDetails.status !== 'COMPLETED' && transactionDetails.status !== 'APPROVED') {
        console.warn(`Transaction is not in a refundable state. Current status: ${transactionDetails.status}`);
        // Continue anyway - we'll let the refund API make the final decision
      }
    } catch (error) {
      console.warn('Could not verify transaction details before refund:', error instanceof Error ? error.message : String(error));
      // Continue with refund attempt even if we can't verify details
      
      // If we're in development mode and can't verify the transaction, use mock response
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using mock refund response in development mode due to transaction verification failure');
        return {
          success: true,
          refundId: mockRefundResponse.id,
          mockResponse: true
        };
      }
    }

    // Try different PayPal API endpoints for the refund
    let response;
    let responseText;
    let responseData;
    
    // If we found a capture ID different from the original transaction ID, try that first
    const refundEndpoints = captureId !== transactionId 
      ? [
          `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
          `${PAYPAL_API_BASE}/v2/payments/captures/${transactionId}/refund`,
          `${PAYPAL_API_BASE}/v2/payments/authorizations/${transactionId}/void`,
          `${PAYPAL_API_BASE}/v2/payments/orders/${transactionId}/refund`
        ]
      : [
          `${PAYPAL_API_BASE}/v2/payments/captures/${transactionId}/refund`,
          `${PAYPAL_API_BASE}/v2/payments/authorizations/${transactionId}/void`,
          `${PAYPAL_API_BASE}/v2/payments/orders/${transactionId}/refund`
        ];
    
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of refundEndpoints) {
      try {
        console.log(`Attempting refund using endpoint: ${endpoint}`);
        
        response = await fetch(endpoint, {
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
            note_to_payer: reason.substring(0, 255) // Ensure note is not too long
          })
        });
        
        responseText = await response.text();
        
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.warn(`Failed to parse response from ${endpoint}: ${responseText}`);
          continue; // Try next endpoint
        }
        
        if (response.ok) {
          console.log(`PayPal refund successful using endpoint: ${endpoint}`, responseData);
          return {
            success: true,
            refundId: responseData.id
          };
        } else {
          // Store the error but continue trying other endpoints
          lastError = {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          };
          console.warn(`Refund failed with endpoint ${endpoint}:`, lastError);
        }
      } catch (endpointError) {
        console.warn(`Error trying endpoint ${endpoint}:`, endpointError);
      }
    }
    
    // If we get here, all endpoints failed
    console.error('All PayPal refund endpoints failed. Last error:', lastError);
    
    // In development mode, return a mock successful response if all endpoints failed
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock refund response in development mode after all endpoints failed');
      return {
        success: true,
        refundId: mockRefundResponse.id,
        mockResponse: true
      };
    }
    
    // Return the last error we encountered
    if (lastError) {
      // Handle specific error cases
      const data = lastError.data;
      if (lastError.status === 422) {
        // Extract detailed error information for 422 errors
        const details = data.details?.[0] || {};
        const issueOrDescription = details.issue || details.description || '';
        
        if (issueOrDescription.includes('TRANSACTION_ALREADY_REFUNDED')) {
          return {
            success: false,
            error: 'This transaction has already been refunded'
          };
        } else if (issueOrDescription.includes('MAX_NUMBER_OF_REFUNDS_EXCEEDED')) {
          return {
            success: false,
            error: 'Maximum number of refunds for this transaction has been exceeded'
          };
        } else if (issueOrDescription.includes('REFUND_AMOUNT_EXCEEDED')) {
          return {
            success: false,
            error: 'Refund amount exceeds the available amount'
          };
        } else if (issueOrDescription.includes('TRANSACTION_CANNOT_BE_REFUNDED')) {
          return {
            success: false,
            error: 'This transaction cannot be refunded in its current state'
          };
        }
      }
      
      // General error message if no specific case matched
      return {
        success: false,
        error: `PayPal refund failed: ${data.message || data.error?.message || JSON.stringify(data)}`
      };
    }
    
    return {
      success: false,
      error: 'Failed to process PayPal refund after trying multiple endpoints'
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
    
    // Try different PayPal API endpoints for transaction details
    const detailEndpoints = [
      `${PAYPAL_API_BASE}/v2/checkout/orders/${transactionId}`
    ];
    
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of detailEndpoints) {
      try {
        console.log(`Attempting to get transaction details using endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
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
          console.warn(`Failed to parse response from ${endpoint}: ${responseText}`);
          continue; // Try next endpoint
        }

        if (response.ok) {
          console.log(`Successfully retrieved transaction details from: ${endpoint}`);
          return data;
        } else {
          // Store the error but continue trying other endpoints
          lastError = {
            status: response.status,
            statusText: response.statusText,
            data
          };
          console.warn(`Failed to get transaction details from ${endpoint}:`, lastError);
        }
      } catch (endpointError) {
        console.warn(`Error trying endpoint ${endpoint}:`, endpointError);
      }
    }
    
    // If we get here, all endpoints failed
    console.error('All PayPal transaction detail endpoints failed. Last error:', lastError);
    
    if (lastError) {
      throw new Error(`Failed to get transaction details: ${lastError.data.message || JSON.stringify(lastError.data)}`);
    } else {
      throw new Error('Failed to get transaction details from any PayPal endpoint');
    }
  } catch (error) {
    console.error('Error getting PayPal transaction details:', error);
    throw error;
  }
} 