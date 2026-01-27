import type { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    const result = await AuthService.loginWithGoogle(idToken, userAgent);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({ error: 'refreshToken is required' });
      return;
    }

    const result = await AuthService.refreshSession(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Refresh failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
