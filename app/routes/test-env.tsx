import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    GMAIL_USER_SET: !!process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD_SET: !!process.env.GMAIL_APP_PASSWORD,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
  });
}

export default function TestEnv() {
  return (
    <div>
      <h1>Environment Variables Test</h1>
      <p>Check the Network tab in your browser's developer tools to see the response.</p>
      <p>
        GMAIL_USER: {process.env.GMAIL_USER}
        <br />
        GMAIL_APP_PASSWORD: {process.env.GMAIL_APP_PASSWORD ? "set" : "not set"}
      </p>
    </div>
  );
}
