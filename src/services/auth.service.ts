import { OAuth2Client } from 'google-auth-library';
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'jose';
import { env } from '../config/env';
import * as UserModel from '../models/user.model';
import * as SessionModel from '../models/session.model';
import * as JwtUtils from '../utils/jwt';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const appleJwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export const loginWithGoogle = async (idToken: string, userAgent: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error('Invalid Google Token');
  }

  const user = await UserModel.upsertUserWithGoogle(
    payload.email,
    payload.sub,
    payload.name || '',
    payload.picture || ''
  );

  const accessToken = JwtUtils.generateAccessToken(user.id);
  const refreshToken = JwtUtils.generateRefreshToken(user.id);
  
  // Refresh token expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await SessionModel.createSession(user.id, refreshToken, userAgent, expiresAt);

  return { user, accessToken, refreshToken };
};

const createAppleClientSecret = async (clientId: string) => {
  const privateKey = await importPKCS8(
    env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    'ES256'
  );

  return await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: env.APPLE_KEY_ID })
    .setIssuer(env.APPLE_TEAM_ID)
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .setIssuedAt()
    .setExpirationTime('180d')
    .sign(privateKey);
};

const exchangeAppleCode = async (authorizationCode: string) => {
  const clientId = env.APPLE_IOS_CLIENT_ID;
  const clientSecret = await createAppleClientSecret(clientId);
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = (await response.json()) as {
    id_token?: string;
    refresh_token?: string;
    access_token?: string;
    error?: string;
  };

  if (!response.ok) {
    const errorMessage =
      typeof data?.error === 'string' ? data.error : 'Apple token exchange failed';
    throw new Error(errorMessage);
  }

  return data;
};

const formatFullName = (
  fullName: { givenName?: string; familyName?: string } | null
) => {
  if (!fullName) return null;
  const parts = [fullName.givenName, fullName.familyName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
};

export const loginWithApple = async (
  authorizationCode: string,
  fullName: { givenName?: string; familyName?: string } | null,
  userAgent: string
) => {
  const tokenData = await exchangeAppleCode(authorizationCode);
  const idToken = tokenData.id_token;

  if (!idToken) {
    throw new Error('Invalid Apple token response');
  }

  const clientId = env.APPLE_IOS_CLIENT_ID;
  const { payload } = await jwtVerify(idToken, appleJwks, {
    audience: clientId,
    issuer: 'https://appleid.apple.com',
  });

  const appleId = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email : null;
  const name = formatFullName(fullName);

  if (!appleId) {
    throw new Error('Invalid Apple identity token');
  }

  let user = await UserModel.findUserByAppleId(appleId);

  if (user) {
    user = await UserModel.updateUserAppleProfile(user.id, email, name);
  } else if (email) {
    user = await UserModel.upsertUserWithApple(email, appleId, name);
  } else {
    throw new Error('Apple account email is required for first sign in');
  }

  const accessToken = JwtUtils.generateAccessToken(user.id);
  const refreshToken = JwtUtils.generateRefreshToken(user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await SessionModel.createSession(user.id, refreshToken, userAgent, expiresAt);

  return { user, accessToken, refreshToken };
};

export const refreshSession = async (refreshToken: string) => {
  const session = await SessionModel.findSessionByRefreshToken(refreshToken);
  if (!session) {
    throw new Error('Invalid Refresh Token');
  }

  // Verify the token signature
  try {
    JwtUtils.verifyRefreshToken(refreshToken);
  } catch (error) {
    await SessionModel.deleteSession(refreshToken);
    throw new Error('Invalid Refresh Token');
  }

  const newAccessToken = JwtUtils.generateAccessToken(session.user_id);
  const newRefreshToken = JwtUtils.generateRefreshToken(session.user_id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Parallelize DB operations to improve performance
  const [user, updatedSession] = await Promise.all([
    UserModel.findUserById(session.user_id),
    SessionModel.updateSessionToken(
      refreshToken,
      newRefreshToken,
      expiresAt
    )
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  if (!updatedSession) {
    throw new Error('Invalid Refresh Token');
  }

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
};

export const logout = async (refreshToken: string) => {
  await SessionModel.deleteSession(refreshToken);
};

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const deleteAccount = async (userId: string) => {
  // Delete all sessions first
  await SessionModel.deleteUserSessions(userId);
  // Delete the user
  await UserModel.deleteUser(userId);
};
