import type { RedisClientType } from "redis";

import { inject, injectable } from "inversify";
import crypto from "node:crypto";

import type { GenerateOtpDTO } from "@/dto/generate-otp.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";

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

  /**
   * Helper to generate Redis key (encapsulated for consistency)
   */
  private _getRedisKey(email: string): string {
    return `${OTP_KEY_PREFIX}${email}`;
  }

  async generateOTP({ name, email, password }: GenerateOtpDTO): Promise<void> {
    const otp = crypto.randomInt(100000, 999999).toString();

    const redisKey = this._getRedisKey(email);
    const redisValue = JSON.stringify({ name, email, password, otp });

    await this._redisClient.set(redisKey, redisValue, { expiration: { type: "EX", value: OTP_TTL_SECONDS } });
  }

  async resendOTP(email: string): Promise<void> {
    const stored = await this._redisClient.get(this._getRedisKey(email));
    if (!stored) {
      throw new HttpError(MESSAGES.OTP.EXPIRED, STATUS_CODES.BAD_REQUEST);
    }

    const { name, password } = JSON.parse(stored);
    await this.generateOTP({ name, email, password });
  }

  async verifyOtp({ email, otp }: VerifyOtpDTO) {
    const redisKey = this._getRedisKey(email);
    const stored = await this._redisClient.get(redisKey);
    if (!stored) {
      throw new HttpError(MESSAGES.OTP.EXPIRED, STATUS_CODES.BAD_REQUEST);
    }

    const { name, email: storedEmail, password, otp: storedOtp } = JSON.parse(stored);
    if (storedOtp !== otp || storedEmail !== email) {
      throw new HttpError(MESSAGES.OTP.INVALID, STATUS_CODES.BAD_REQUEST);
    }

    await this._redisClient.del(redisKey);

    return { name, email, password };
  }
}
