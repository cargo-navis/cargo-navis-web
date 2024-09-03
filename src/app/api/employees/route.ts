import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next';
import { employees } from '@/lib/mocks/employees';

export async function GET(req: NextApiRequest) {
  const jwtToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!jwtToken || !jwtToken.accessToken) {
    // Return 401 if there's no valid access token
    return createResponse(401, { error: 'Unauthorized' });
  }

  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // return employees;

  try {
    const response = await fetch(`${baseURL}/api/employees`,{
      headers: { Authorization: `Bearer ${jwtToken.accessToken}` },
    });

    if(!response.ok) {
      const errorData = await response.json();

      if (response.status === 400) {
        return createResponse(400, { message: 'Bad Request: ' + errorData.message });
      } else if (response.status === 404) {
        return createResponse(404, { message: 'Resource Not Found' });
      } else {
        // Generic error handler for other statuses
        return createResponse(response.status, { message: 'An error occurred', details: errorData });
      }
    }

    const data = await response.json();
    return createResponse(response.status, { message: 'Success', data });

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


export async function POST(req: NextApiRequest) {
  // POST request to API

  // async function createEmployee(accessToken: string, data: string) {
  //   const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  //   return fetch(`${baseURL}/api/employees`,{
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //     body: data
  //   });
  // }
}

