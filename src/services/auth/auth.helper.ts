import type { SignOptions } from "jsonwebtoken";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";
import argon2 from "argon2";
import { injectable } from "inversify";
import jwt from "jsonwebtoken";

import type { JWTPayload } from "@/types";

import { MESSAGES } from "@/config/messages.constant";
import env from "@/config/validate-env";
import { HttpError } from "@/utils/http-error-class";

@injectable()
export class AuthHelper {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async validatePassword(raw: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, raw);
  }

  createJwtPayload(user: any) {
    return { sub: user._id, email: user.email, role: user.role, tenantId: user.tenantId };
  }

  signToken(payload: object, expiresIn: string): string {
    const options = {
      expiresIn,
      algorithm: "RS256",
      issuer: "fleet-os",
    } as SignOptions;

    return jwt.sign(payload, env.PRIVATE_KEY, options);
  }

  decodeToken(token: string): JWTPayload {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || typeof decoded === "string") {
      throw new HttpError(MESSAGES.TOKEN.INVALID_REFRESH_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }
    return decoded;
  }

  generateTokens(payload: JWTPayload) {
    const accessToken = this.signToken(payload, env.ACCESS_TOKEN_EXP);
    const refreshToken = this.signToken(payload, env.REFRESH_TOKEN_EXP);
    return { accessToken, refreshToken };
  }
}
