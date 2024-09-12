import { type LoginArgs, login } from '@/lib/api';
import type { AuthResponse } from '@/lib/api/login';
import { setAuthTokens } from '@/lib/utils/session';

export function useLogin() {
  const { authUser } = useAuth<LoginArgs>(login);
  return { loginUser: authUser };
}

function useAuth<T>(authFunc: (args: T) => Promise<AuthResponse.RootObject>) {
  async function authUser(args: T) {
    const authRes = await authFunc(args);
    storeAuthRes(authRes);
  }

  return { authUser };
}

function storeAuthRes(authRes: AuthResponse.RootObject) {
  setAuthTokens({ accessToken: authRes.token });
}
