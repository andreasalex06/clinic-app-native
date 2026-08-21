export type VisitStatus = "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";

export type VisitPatient = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

export type VisitDoctor = {
  id: string;
  name: string;
  specialization: string;
  phone: string;
};

export type Visit = {
  id: string;
  visitNumber: string;
  status: VisitStatus;
  checkInTime: string;
  patient: VisitPatient;
  doctor: VisitDoctor;
};

export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  WAITING: "Menunggu",
  IN_CONSULTATION: "Konsultasi",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};
