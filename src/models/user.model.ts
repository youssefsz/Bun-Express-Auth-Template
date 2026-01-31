import { query } from '../config/db';

export interface User {
  id: string;
  email: string;
  google_id: string | null;
  apple_id: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export const upsertUserWithGoogle = async (
  email: string,
  googleId: string,
  name: string,
  avatarUrl: string
): Promise<User> => {
  const result = await query(
    `INSERT INTO users (email, google_id, name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE 
     SET name = EXCLUDED.name,
         avatar_url = EXCLUDED.avatar_url,
         google_id = COALESCE(EXCLUDED.google_id, users.google_id),
         updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [email, googleId, name, avatarUrl]
  );
  return result.rows[0];
};

export const upsertUserWithApple = async (
  email: string,
  appleId: string,
  name: string | null
): Promise<User> => {
  const result = await query(
    `INSERT INTO users (email, apple_id, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE 
     SET name = COALESCE(EXCLUDED.name, users.name),
         apple_id = COALESCE(EXCLUDED.apple_id, users.apple_id),
         updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [email, appleId, name]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserByAppleId = async (
  appleId: string
): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE apple_id = $1', [
    appleId,
  ]);
  return result.rows[0] || null;
};

export const updateUserAppleProfile = async (
  userId: string,
  email: string | null,
  name: string | null
): Promise<User> => {
  const result = await query(
    `UPDATE users
     SET email = COALESCE($2, email),
         name = COALESCE($3, name),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [userId, email, name]
  );
  return result.rows[0];
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const deleteUser = async (id: string): Promise<void> => {
  await query('DELETE FROM users WHERE id = $1', [id]);
};
