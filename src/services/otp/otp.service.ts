import type { RedisClientType } from "redis";

import { inject, injectable } from "inversify";
import crypto from "node:crypto";

import type { GenerateOtpDTO } from "@/dto/generate-otp.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { StoredOtp } from "@/types";

import { MESSAGES } from "@/config/constants/messages.constant";
import { STATUS_CODES } from "@/config/constants/status-codes.constant";
import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IOtpService } from "./otp.service.interface";

const OTP_TTL_SECONDS = 5 * 60;
const OTP_KEY_PREFIX = "otp:";

@injectable()
export class OtpService implements IOtpService {
  constructor(@inject(TYPES.RedisClient) private _redisClient: RedisClientType) {}

  /* -------------------------------------------------------------------------- */
  /*                               Helper Methods                               */
  /* -------------------------------------------------------------------------- */
  private _getRedisKey(email: string): string {
    return `${OTP_KEY_PREFIX}${email}`;
  }

  private _generateCode(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  private _serialize(data: object): string {
    return JSON.stringify(data);
  }

  private _deserialize<T>(json: string): T {
    return JSON.parse(json);
  }

  private async _saveOtp(email: string, data: StoredOtp): Promise<void> {
    await this._redisClient.set(this._getRedisKey(email), this._serialize(data), {
      expiration: { type: "EX", value: OTP_TTL_SECONDS },
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                               Services                                     */
  /* -------------------------------------------------------------------------- */

  async generateOTP({ name, email, password }: GenerateOtpDTO): Promise<void> {
    const otp = this._generateCode();

    await this._saveOtp(email, { name, email, password, otp });
  }

  async resendOTP(email: string): Promise<void> {
    const existingJson = await this._redisClient.get(this._getRedisKey(email));
    if (!existingJson) {
      throw new HttpError(MESSAGES.OTP.EXPIRED, STATUS_CODES.BAD_REQUEST);
    }

    const stored = this._deserialize<StoredOtp>(existingJson);
    await this.generateOTP({ name: stored.name, email, password: stored.password });
  }

  async verifyOtp({ email, otp }: VerifyOtpDTO): Promise<StoredOtp> {
    const redisKey = this._getRedisKey(email);
    const storedJson = await this._redisClient.get(redisKey);
    if (!storedJson) {
      throw new HttpError(MESSAGES.OTP.EXPIRED, STATUS_CODES.BAD_REQUEST);
    }

    const stored = this._deserialize<StoredOtp>(storedJson);
    if (stored.email !== email || stored.otp !== otp) {
      throw new HttpError(MESSAGES.OTP.INVALID, STATUS_CODES.BAD_REQUEST);
    }

    await this._redisClient.del(redisKey);

    return stored;
  }
}
