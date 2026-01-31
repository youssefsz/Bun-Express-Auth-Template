import type { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader || 'Unknown';
    
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

export const appleLogin = async (req: Request, res: Response) => {
  try {
    const { authorizationCode, fullName } = req.body;
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader || 'Unknown';

    if (!authorizationCode) {
      res.status(400).json({ error: 'authorizationCode is required' });
      return;
    }

    const result = await AuthService.loginWithApple(
      authorizationCode,
      fullName || null,
      userAgent
    );
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

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await AuthService.getCurrentUser(req.user.userId);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await AuthService.deleteAccount(req.user.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Delete account failed' });
  }
};
