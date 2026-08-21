export type Diagnosis = {
  id: string;
  code: string;
  name: string;
};

export type Treatment = {
  id: string;
  name: string;
  price: number;
};

export type Medicine = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type SelectedMedicine = {
  medicineId: string;
  quantity: number;
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
