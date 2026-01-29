import { query } from '../config/db';

export interface User {
  id: string;
  email: string;
  google_id: string;
  name: string;
  avatar_url: string;
  created_at: Date;
  updated_at: Date;
}

export const createUser = async (email: string, googleId: string, name: string, avatarUrl: string): Promise<User> => {
  const result = await query(
    `INSERT INTO users (email, google_id, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE 
     SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, google_id = EXCLUDED.google_id, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [email, googleId, name, avatarUrl]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const deleteUser = async (id: string): Promise<void> => {
  await query('DELETE FROM users WHERE id = $1', [id]);
};
