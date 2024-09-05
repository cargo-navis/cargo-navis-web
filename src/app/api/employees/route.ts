import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server';
import { backend } from '@/lib/services/backendService';
import { edgeBackend } from '@/lib/services/edgeBackend';
import { Employee } from '@/lib/api/employees.d';
import { AxiosError, AxiosResponse } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(req: NextRequest) {
  const jwtToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!jwtToken || !jwtToken.accessToken) {
    // Return 401 if there's no valid access token
    return createResponse(401, { error: 'Unauthorized' });
  }

  try {
    const res: AxiosResponse = await edgeBackend.get(`/api/employees`, { accessToken: 'jwtToken.accessToken' as string, fullResponse: true });
    return createResponse(res.status, res.data);

  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const details = error.response?.data;
    return createResponse(status || 500, { message, details });
  }
}

function createResponse(status: number, data: any, options?: any) {
  return new Response(
    JSON.stringify(data),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}


export async function POST(req: NextRequest) {
  const jwtToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!jwtToken || !jwtToken.accessToken) {
    // Return 401 if there's no valid access token
    return createResponse(401, { error: 'Unauthorized' });
  }

  console.log(jwtToken.accessToken)

  try {
    const body = await req.json();
    console.log(body);

    const response = await fetch(`${baseURL}/api/employees`,{
      headers: { Authorization: `Bearer ${jwtToken.accessToken}` },
      method: 'POST',
      body: JSON.stringify(body)
    });

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
