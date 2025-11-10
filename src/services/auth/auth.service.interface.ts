import type { LoginDTO } from "@/dto/login.dto";
import type { RegisterDTO } from "@/dto/register.dto";

export type IAuthService = {
  register: (data: RegisterDTO) => any;
  login: (data: LoginDTO) => any;
};
