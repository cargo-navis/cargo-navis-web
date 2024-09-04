import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function PATCH(req: NextRequest) {
  const jwtToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!jwtToken || !jwtToken.accessToken) {
    // Return 401 if there's no valid access token
    return createResponse(401, { error: 'Unauthorized' });
  }

  try {
    const body = await req.json();

    const response = await fetch(`${baseURL}/api/employees`,{
      headers: { Authorization: `Bearer ${jwtToken.accessToken}` },
      method: 'PATCH',
      body: JSON.stringify(body)
    });

    console.log('AND RESPONSE ISSSSS', response.status)

    if(!response.ok) {
      if (response.status === 400) {
        return createResponse(400, { message: 'Bad Request' });
      } else if (response.status === 404) {
        return createResponse(404, { message: 'Resource Not Found' });
      } else {
        // Generic error handler for other statuses
        return createResponse(response.status, { message: 'An error occurred' });
      }
    }

    const data = await response.json();
    return createResponse(response.status, data);


  } catch (error: any) {
    // Handle network errors or unexpected errors
    console.error('Error fetching data from backend:', error);
    return createResponse(500, { message: 'Internal Server Error', details: error.message });
  }
}

function createResponse(status: number, data: any, options?: any) {
  return new Response(
    JSON.stringify(data),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}
