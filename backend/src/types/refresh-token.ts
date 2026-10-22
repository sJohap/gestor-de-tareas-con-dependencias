export type RefreshToken = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export type NewRefreshToken = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};
