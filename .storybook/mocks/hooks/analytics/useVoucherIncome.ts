import type { BarChartItemProps } from "@/features/admin/analytics-management/types/barChartItem";
import type { PeriodLabelProps } from "@/features/admin/analytics-management/types/period";
import { fakeVouchers } from "../users/useVouchers";
import { productCategories } from "@/features/bar/utils/productCategories";

const fakeVoucherIncomeByCategory: BarChartItemProps[] = productCategories.map((category) => ({
  id: category.id,
  title: category.title,
  value: fakeVouchers
    .filter((voucher) => voucher.paymentStatus === "confirmed" && voucher.product.category === category.id)
    .reduce((accumulator, voucher) => accumulator + voucher.quantity * voucher.product.price, 0),
}));

const fakeVoucherIncome = fakeVoucherIncomeByCategory[0];

const useVoucherIncome = (_selectedPeriod: PeriodLabelProps, selectedCategory: string) => {
  const voucherIncomeByCategory =
    selectedCategory === "all_categories" ? fakeVoucherIncomeByCategory : fakeVoucherIncomeByCategory.filter((item) => item.id === selectedCategory);

  return {
    voucherIncomeByCategory,
    totalVoucherIncome: voucherIncomeByCategory.reduce((accumulator, item) => accumulator + item.value, 0),
    isLoading: false,
    error: null,
  };
};

export { useVoucherIncome, fakeVoucherIncomeByCategory, fakeVoucherIncome };
