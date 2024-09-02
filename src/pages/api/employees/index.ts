import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(400).json({ message: 'Invalid HTTP method. Only GET requests are allowed' });
  }

  // const session = await getServerSession(req, res, authOptions);
  const jwtToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!jwtToken || !jwtToken.accessToken) {
    // Return 401 if there's no valid access token
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const result = await fetch(`${baseURL}/api/employees`,{
    headers: { Authorization: `Bearer ${jwtToken.accessToken}` },
  });

  const data = await result.json();

  return res.json({
    message: "Success",
    data
  });
}