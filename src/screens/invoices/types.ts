export type InvoiceStatus = "UNPAID" | "PAID";

export type InvoiceItem = {
  id: string;
  item: string;
  quantity: number;
  price: number;
  amount: number;
};

export type InvoicePatient = {
  id: string;
  name: string;
  phone: string;
};

export type InvoiceDoctor = {
  id: string;
  name: string;
  specialization: string;
};

export type InvoiceVisit = {
  id: string;
  visitNumber: string;
  checkInTime: string;
  patient: InvoicePatient;
  doctor: InvoiceDoctor;
  invoice: InvoiceSummary | null;
};

export type InvoiceSummary = {
  id: string;
  invoiceNo: string;
  visitId: string;
  status: InvoiceStatus;
  total: number;
  paidAt: string | null;
  createdAt: string;
};

export type InvoiceDetail = InvoiceSummary & {
  items: InvoiceItem[];
  visit: {
    id: string;
    visitNumber: string;
    checkInTime: string;
    patient: InvoicePatient;
    doctor: InvoiceDoctor;
  };
};

export type InvoiceListItem = InvoiceSummary & {
  visit: {
    id: string;
    visitNumber: string;
    checkInTime: string;
    patient: InvoicePatient;
    doctor: InvoiceDoctor;
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type InvoiceListSummary = {
  totalInvoices: number;
  totalUnpaid: number;
};

export type InvoiceListResponse = {
  data: InvoiceListItem[];
  meta: PaginationMeta;
  summary: InvoiceListSummary;
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
