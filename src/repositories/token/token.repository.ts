import { injectable } from "inversify";

import type { IRefreshToken } from "@/models/refresh-token.model";

import RefreshToken from "@/models/refresh-token.model";

import type { ITokenRepository } from "./token.repository.interface";

@injectable()
export class TokenRepository implements ITokenRepository {
  async create(data: Partial<IRefreshToken>): Promise<IRefreshToken> {
    const token = new RefreshToken(data);
    return token.save();
  }

  async findByToken(token: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({ token }).populate("user");
  }

  async revoke(token: IRefreshToken): Promise<void> {
    token.revoked = true;
    await token.save();
  }

  async deleteAllTokens(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ user: userId });
  }
}
