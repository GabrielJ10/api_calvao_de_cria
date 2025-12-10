export interface IUpdateUserDTO {
  name?: string;
  phone?: string;
  birthDate?: string; // ISO Date string
  cpf?: string;
}

export interface IAdminUserQueryDTO {
  page?: number;
  limit?: number;
  role?: 'admin' | 'customer';
  search?: string;
}
