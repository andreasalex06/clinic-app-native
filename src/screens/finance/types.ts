import { InvoiceListItem } from "@/screens/invoices/types";

export type FinancePeriod = "daily" | "weekly" | "monthly";

export type FinanceTrend = {
  key: string;
  label: string;
  patients: number;
  revenue: number;
};

export type FinanceSummary = {
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  outstandingRevenue: number;
};

export type FinanceData = {
  summary: FinanceSummary;
  trends: FinanceTrend[];
  recentInvoices: InvoiceListItem[];
};

export type FinanceResponse = {
  data: FinanceData;
};
