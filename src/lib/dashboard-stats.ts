import { getSaleTotal } from "@/lib/costing"
import type { Expense, Product, Sale } from "@/lib/types"

export type DashboardSummaryCard = {
  label: string
  value: string
  trend: string | null
  trendUp: boolean
  description: string
}

export type DashboardChartPoint = {
  date: string
  sales: number
}

export type DashboardRecentSale = {
  id: string
  product: string
  quantity: number
  total: number
  date: string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function sumSalesInRange(sales: Sale[], start: string, end: string): number {
  return sales
    .filter((sale) => sale.date >= start && sale.date <= end)
    .reduce((sum, sale) => sum + getSaleTotal(sale), 0)
}

function sumExpensesInRange(
  expenses: Expense[],
  start: string,
  end: string
): number {
  return expenses
    .filter((expense) => expense.date >= start && expense.date <= end)
    .reduce((sum, expense) => sum + expense.amount, 0)
}

function formatPercentChange(
  current: number,
  previous: number
): { label: string; trendUp: boolean } | null {
  if (current === 0 && previous === 0) return null
  if (previous === 0) {
    return { label: "+100%", trendUp: true }
  }

  const change = ((current - previous) / previous) * 100
  const trendUp = change >= 0
  const prefix = trendUp ? "+" : ""

  return {
    label: `${prefix}${change.toFixed(1)}%`,
    trendUp,
  }
}

function formatChartDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatRecentSaleDate(isoDate: string, today: string): string {
  const yesterday = addDays(today, -1)
  if (isoDate === today) return "Today"
  if (isoDate === yesterday) return "Yesterday"
  return formatChartDate(isoDate)
}

export function buildDashboardSummary(
  sales: Sale[],
  expenses: Expense[],
  formatValue: (value: number) => string
): DashboardSummaryCard[] {
  const today = todayIso()
  const yesterday = addDays(today, -1)
  const weekStart = addDays(today, -6)
  const lastWeekStart = addDays(today, -13)
  const lastWeekEnd = addDays(today, -7)

  const todaySales = sumSalesInRange(sales, today, today)
  const yesterdaySales = sumSalesInRange(sales, yesterday, yesterday)
  const thisWeekRevenue = sumSalesInRange(sales, weekStart, today)
  const lastWeekRevenue = sumSalesInRange(sales, lastWeekStart, lastWeekEnd)
  const thisWeekExpenses = sumExpensesInRange(expenses, weekStart, today)
  const lastWeekExpenses = sumExpensesInRange(expenses, lastWeekStart, lastWeekEnd)
  const thisWeekProfit = thisWeekRevenue - thisWeekExpenses
  const lastWeekProfit = lastWeekRevenue - lastWeekExpenses

  const todayTrend = formatPercentChange(todaySales, yesterdaySales)
  const weekRevenueTrend = formatPercentChange(thisWeekRevenue, lastWeekRevenue)
  const weekExpensesTrend = formatPercentChange(thisWeekExpenses, lastWeekExpenses)
  const weekProfitTrend = formatPercentChange(thisWeekProfit, lastWeekProfit)

  return [
    {
      label: "Today's Sales",
      value: formatValue(todaySales),
      trend: todayTrend?.label ?? null,
      trendUp: todayTrend?.trendUp ?? true,
      description: "vs. yesterday",
    },
    {
      label: "This Week's Revenue",
      value: formatValue(thisWeekRevenue),
      trend: weekRevenueTrend?.label ?? null,
      trendUp: weekRevenueTrend?.trendUp ?? true,
      description: "vs. last week",
    },
    {
      label: "This Week's Expenses",
      value: formatValue(thisWeekExpenses),
      trend: weekExpensesTrend?.label ?? null,
      trendUp: weekExpensesTrend ? !weekExpensesTrend.trendUp : false,
      description: "vs. last week",
    },
    {
      label: "Net Profit",
      value: formatValue(thisWeekProfit),
      trend: weekProfitTrend?.label ?? null,
      trendUp: weekProfitTrend?.trendUp ?? true,
      description: "this week · vs. last week",
    },
  ]
}

export function buildSalesChartData(
  sales: Sale[],
  days = 14
): DashboardChartPoint[] {
  const today = todayIso()
  const points: DashboardChartPoint[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const isoDate = addDays(today, -offset)
    const total = sumSalesInRange(sales, isoDate, isoDate)
    points.push({
      date: formatChartDate(isoDate),
      sales: total,
    })
  }

  return points
}

export function buildRecentSales(
  sales: Sale[],
  products: Product[],
  limit = 5
): DashboardRecentSale[] {
  const today = todayIso()

  return [...sales]
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date < b.date ? 1 : -1
      }
      return a.id < b.id ? 1 : -1
    })
    .slice(0, limit)
    .map((sale) => {
      const product = products.find((item) => item.id === sale.productId)
      return {
        id: sale.id,
        product: product?.name ?? "Unknown product",
        quantity: sale.quantity,
        total: getSaleTotal(sale),
        date: formatRecentSaleDate(sale.date, today),
      }
    })
}
