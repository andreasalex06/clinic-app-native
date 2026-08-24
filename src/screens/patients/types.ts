export type Gender = "MALE" | "FEMALE";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  gender: Gender;
  birthDate: string;
  address: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PatientListResponse = {
  data: Patient[];
  meta: PaginationMeta;
};

export type PatientForm = {
  name: string;
  phone: string;
  gender: Gender;
  birthDate: string;
  address: string;
};

export const EMPTY_FORM: PatientForm = {
  name: "",
  phone: "",
  gender: "MALE",
  birthDate: "",
  address: "",
};

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
};
