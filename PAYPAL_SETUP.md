# PayPal Integration Setup

This document provides instructions for setting up PayPal integration for the booking system.

## Issue: PayPal Authentication Failure

If you're seeing errors like this:

```
Error processing PayPal refund: Error: Failed to get PayPal access token: {"error":"invalid_client","error_description":"Client Authentication failed"}
```

It means your PayPal API credentials are either missing or incorrect.

## Solution

### 1. Get PayPal API Credentials

1. Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal account
3. Navigate to "My Apps & Credentials"
4. Select the appropriate environment (Sandbox for testing, Live for production)
5. Create a new app or select an existing one
6. Copy the **Client ID** and **Client Secret**

### 2. Update Your Environment Variables

Add these credentials to your `.env` file:

```
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
```

Make sure the Client ID and Client Secret are different values. They should not be identical.

### 3. Test Your Credentials

Run the check script to verify your credentials:

```
node app/utils/check-paypal-credentials.js
```

If successful, you should see:

```
✅ Successfully authenticated with PayPal!
```

## Development Mode Fallback

For development purposes, the application includes a fallback mechanism that will simulate successful refunds when PayPal credentials are missing or invalid. This allows you to test the refund functionality without valid PayPal credentials.

When using this fallback:
- Refunds will appear to succeed
- A mock refund ID will be generated
- The booking will be marked as refunded
- The database will record that a mock refund was used

This fallback only works in development mode (`NODE_ENV !== 'production'`).

## Troubleshooting

If you're still having issues:

1. **Check for typos**: Make sure there are no extra spaces or characters in your credentials
2. **Verify the app permissions**: In the PayPal Developer Dashboard, ensure your app has the necessary permissions for refunds
3. **Check API version**: This integration uses PayPal API v2
4. **Environment mismatch**: Make sure you're using sandbox credentials for development and live credentials for production

For more information, refer to the [PayPal API documentation](https://developer.paypal.com/docs/api/overview/). 