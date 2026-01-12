import type { Request, Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";

import type { IUserService } from "@/services/user/user.service.interface";

import TYPES from "@/di/types";
import { MarkOnboardingCompleteSchema } from "@/dto/mark-onboarding-complete.dto";

@injectable()
export class InternalController {
  constructor(@inject(TYPES.UserService) private _userService: IUserService) {}

  async markUserOnboarded(req: Request, res: Response) {
    const { userId } = req.params;

    // Validate params
    const validation = MarkOnboardingCompleteSchema.safeParse({ userId });

    if (!validation.success) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid request",
      });
      return;
    }

    await this._userService.markUserOnboardingComplete(userId);

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "User onboarding marked as complete",
    });
  }
}
