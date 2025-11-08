import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";

import type { IAuthService } from "@/services/auth/auth.service.interface";

import TYPES from "@/di/types";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private _authService: IAuthService) {}

  register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const user = await this._authService.register(name, email, password);
    res.status(StatusCodes.OK).json({ message: "User registered", user });
  };
}
