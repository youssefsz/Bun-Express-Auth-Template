import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import * as UserModel from '../models/user.model';
import * as SessionModel from '../models/session.model';
import * as JwtUtils from '../utils/jwt';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (idToken: string, userAgent: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error('Invalid Google Token');
  }

  const user = await UserModel.createUser(
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

  const user = await UserModel.findUserById(session.user_id);
  if (!user) {
    throw new Error('User not found');
  }

  const newAccessToken = JwtUtils.generateAccessToken(user.id);
  
  return { accessToken: newAccessToken };
};

export const logout = async (refreshToken: string) => {
  await SessionModel.deleteSession(refreshToken);
};
