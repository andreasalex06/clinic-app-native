export type PharmacyStatus = "WAITING_PAYMENT" | "PREPARING" | "READY_FOR_PICKUP" | "COMPLETED";

export type PharmacyOrder = {
  id: string;
  status: PharmacyStatus;
  queueNumber: number | null;
  queueDate: string | null;
  visit: {
    id: string;
    visitNumber: string;
    patient: {
      id: string;
      name: string;
      phone: string;
    };
    doctor: {
      id: string;
      name: string;
      specialization: string;
    };
    invoice: {
      id: string;
      status: "UNPAID" | "PAID";
      total: number;
    } | null;
    consultation: {
      medicines: Array<{
        id: string;
        quantity: number;
        medicine: {
          id: string;
          name: string;
        };
      }>;
    } | null;
  };
};

export type PharmacyListResponse = {
  data: PharmacyOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const PHARMACY_STATUS_LABEL: Record<PharmacyStatus, string> = {
  WAITING_PAYMENT: "Menunggu Bayar",
  PREPARING: "Obat Diracik",
  READY_FOR_PICKUP: "Siap Diambil",
  COMPLETED: "Selesai",
};
