export interface IRegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  birthDate?: Date;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IUserWithTokens {
  user: any; // Will be transformed user data
  accessToken: string;
  refreshToken: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IResetPasswordTokenResponse {
  resetToken?: string;
}
