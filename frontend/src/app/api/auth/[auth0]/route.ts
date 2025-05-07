//import { handleAuth } from '@auth0/nextjs-auth0';

import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';
import { handleAuth } from '@auth0/nextjs-auth0';

// Auth0Client irá ler as variáveis de ambiente de .env.local por padrão.
const auth0 = new Auth0Client();

export const GET = handleAuth();

export async function POST(req: NextRequest) {
  return auth0.middleware(req);
}

