import type { IRefreshToken } from "@/models/refresh-token.model";

export type ITokenRepository = {
  create: (data: Partial<IRefreshToken>) => Promise<IRefreshToken>;
  findByToken: (token: string) => Promise<IRefreshToken | null>;
  revoke: (token: IRefreshToken) => Promise<void>;
  deleteAllTokens: (userId: string) => Promise<void>;
};
