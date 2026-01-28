import { query } from '../config/db';

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  user_agent: string;
  expires_at: Date;
  created_at: Date;
}

export const createSession = async (userId: string, refreshToken: string, userAgent: string, expiresAt: Date): Promise<Session> => {
  const result = await query(
    `INSERT INTO sessions (user_id, refresh_token, user_agent, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, refreshToken, userAgent, expiresAt]
  );
  return result.rows[0];
};

export const findSessionByRefreshToken = async (refreshToken: string): Promise<Session | null> => {
  const result = await query('SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()', [refreshToken]);
  return result.rows[0] || null;
};

export const deleteSession = async (refreshToken: string): Promise<void> => {
  await query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
};

export const deleteUserSessions = async (userId: string): Promise<void> => {
  await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
};

export const updateSessionToken = async (
  currentRefreshToken: string,
  newRefreshToken: string,
  expiresAt: Date
): Promise<Session | null> => {
  const result = await query(
    `UPDATE sessions
     SET refresh_token = $1, expires_at = $2
     WHERE refresh_token = $3
     RETURNING *`,
    [newRefreshToken, expiresAt, currentRefreshToken]
  );
  return result.rows[0] || null;
};
