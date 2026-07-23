import { getSaleTotal } from "@/lib/costing"
import type { Expense, Product, ProductCategory, Sale } from "@/lib/types"

const PH_TIMEZONE = "Asia/Manila"

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

export type DashboardPeriodMetric = {
  label: string
  value: string
  trend: string | null
  trendUp: boolean
}

export type DashboardPeriodSummary = {
  title: string
  description: string
  sales: DashboardPeriodMetric
  expenses: DashboardPeriodMetric
  net: DashboardPeriodMetric
}

export type DashboardTopProduct = {
  productId: string
  name: string
  category: string
  price: number | null
  quantity: number
  revenue: number
  orders: number
  avgOrderValue: number
}

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function toManilaDate(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00+08:00`)
}

function addDays(isoDate: string, days: number): string {
  const date = toManilaDate(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function getWeekStart(isoDate: string): string {
  const dayOfWeek = toManilaDate(isoDate).getUTCDay()
  const daysSinceMonday = (dayOfWeek + 6) % 7
  return addDays(isoDate, -daysSinceMonday)
}

function getWeekRange(isoDate: string): { start: string; end: string } {
  const start = getWeekStart(isoDate)
  return { start, end: addDays(start, 6) }
}

export type DateFilterPreset = "today" | "yesterday" | "week" | "all"

export function getDateFilterRange(
  preset: DateFilterPreset
): { start: string; end: string } | null {
  if (preset === "all") return null

  const today = todayIso()

  if (preset === "today") return { start: today, end: today }
  if (preset === "yesterday") {
    const yesterday = addDays(today, -1)
    return { start: yesterday, end: yesterday }
  }

  return { start: getWeekStart(today), end: today }
}

function getLastWeekRange(today: string): { start: string; end: string } {
  const thisWeekStart = getWeekStart(today)
  const start = addDays(thisWeekStart, -7)
  return { start, end: addDays(start, 6) }
}

function getThisMonthRange(today: string): { start: string; end: string } {
  const [year, month] = today.split("-")
  return { start: `${year}-${month}-01`, end: today }
}

function getLastMonthRange(today: string): { start: string; end: string } {
  const thisMonthStart = getThisMonthRange(today).start
  const lastMonthEnd = addDays(thisMonthStart, -1)
  const [year, month] = lastMonthEnd.split("-")
  return { start: `${year}-${month}-01`, end: lastMonthEnd }
}

function getThisYearRange(today: string): { start: string; end: string } {
  const [year] = today.split("-")
  return { start: `${year}-01-01`, end: today }
}

function getLastYearRange(today: string): { start: string; end: string } {
  const [year, month, day] = today.split("-")
  const lastYear = String(Number(year) - 1)
  return { start: `${lastYear}-01-01`, end: `${lastYear}-${month}-${day}` }
}

function formatMonthLabel(isoDate: string): string {
  return toManilaDate(isoDate).toLocaleDateString("en-PH", {
    timeZone: PH_TIMEZONE,
    month: "long",
    year: "numeric",
  })
}

function formatYearLabel(isoDate: string): string {
  return toManilaDate(isoDate).toLocaleDateString("en-PH", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
  })
}

function buildPeriodMetric(
  label: string,
  current: number,
  previous: number,
  formatValue: (value: number) => string,
  invertTrend = false
): DashboardPeriodMetric {
  const trend = formatPercentChange(current, previous)

  return {
    label,
    value: formatValue(current),
    trend: trend?.label ?? null,
    trendUp: trend ? (invertTrend ? !trend.trendUp : trend.trendUp) : true,
  }
}

function buildPeriodSummary(
  title: string,
  description: string,
  sales: { current: number; previous: number },
  expenses: { current: number; previous: number },
  formatValue: (value: number) => string
): DashboardPeriodSummary {
  const netCurrent = sales.current - expenses.current
  const netPrevious = sales.previous - expenses.previous

  return {
    title,
    description,
    sales: buildPeriodMetric("Sales", sales.current, sales.previous, formatValue),
    expenses: buildPeriodMetric(
      "Expenses",
      expenses.current,
      expenses.previous,
      formatValue,
      true
    ),
    net: buildPeriodMetric("Net", netCurrent, netPrevious, formatValue),
  }
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

function sumQuantityInRange(
  sales: Sale[],
  start: string,
  end: string
): number {
  return sales
    .filter((sale) => sale.date >= start && sale.date <= end)
    .reduce((sum, sale) => sum + sale.quantity, 0)
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
  return toManilaDate(isoDate).toLocaleDateString("en-PH", {
    timeZone: PH_TIMEZONE,
    month: "short",
    day: "numeric",
  })
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
  const thisWeek = getWeekRange(today)
  const lastWeek = getLastWeekRange(today)

  const todaySales = sumSalesInRange(sales, today, today)
  const yesterdaySales = sumSalesInRange(sales, yesterday, yesterday)
  const thisWeekRevenue = sumSalesInRange(
    sales,
    thisWeek.start,
    today
  )
  const lastWeekRevenue = sumSalesInRange(
    sales,
    lastWeek.start,
    lastWeek.end
  )
  const thisWeekExpenses = sumExpensesInRange(
    expenses,
    thisWeek.start,
    today
  )
  const lastWeekExpenses = sumExpensesInRange(
    expenses,
    lastWeek.start,
    lastWeek.end
  )
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
      description: "Mon–today · vs. last week",
    },
    {
      label: "This Week's Expenses",
      value: formatValue(thisWeekExpenses),
      trend: weekExpensesTrend?.label ?? null,
      trendUp: weekExpensesTrend ? !weekExpensesTrend.trendUp : false,
      description: "Mon–today · vs. last week",
    },
    {
      label: "Net Profit",
      value: formatValue(thisWeekProfit),
      trend: weekProfitTrend?.label ?? null,
      trendUp: weekProfitTrend?.trendUp ?? true,
      description: "Mon–today · vs. last week",
    },
  ]
}

export function buildSoldSummary(
  sales: Sale[],
  formatValue: (value: number) => string
): DashboardSummaryCard[] {
  const today = todayIso()
  const yesterday = addDays(today, -1)
  const thisMonth = getThisMonthRange(today)
  const lastMonth = getLastMonthRange(today)

  const salesToday = sumSalesInRange(sales, today, today)
  const salesYesterday = sumSalesInRange(sales, yesterday, yesterday)
  const soldToday = sumQuantityInRange(sales, today, today)
  const soldYesterday = sumQuantityInRange(sales, yesterday, yesterday)

  const totalSales = sales.reduce((sum, sale) => sum + getSaleTotal(sale), 0)
  const totalSold = sales.reduce((sum, sale) => sum + sale.quantity, 0)
  const salesThisMonth = sumSalesInRange(sales, thisMonth.start, thisMonth.end)
  const salesLastMonth = sumSalesInRange(sales, lastMonth.start, lastMonth.end)
  const soldThisMonth = sumQuantityInRange(sales, thisMonth.start, thisMonth.end)
  const soldLastMonth = sumQuantityInRange(sales, lastMonth.start, lastMonth.end)

  const salesTodayTrend = formatPercentChange(salesToday, salesYesterday)
  const soldTodayTrend = formatPercentChange(soldToday, soldYesterday)
  const salesMonthTrend = formatPercentChange(salesThisMonth, salesLastMonth)
  const soldMonthTrend = formatPercentChange(soldThisMonth, soldLastMonth)

  return [
    {
      label: "Sales Today",
      value: formatValue(salesToday),
      trend: salesTodayTrend?.label ?? null,
      trendUp: salesTodayTrend?.trendUp ?? true,
      description: "Revenue today · vs. yesterday",
    },
    {
      label: "Sold Today",
      value: soldToday.toLocaleString(),
      trend: soldTodayTrend?.label ?? null,
      trendUp: soldTodayTrend?.trendUp ?? true,
      description: "Units sold today · vs. yesterday",
    },
    {
      label: "Total Sales",
      value: formatValue(totalSales),
      trend: salesMonthTrend?.label ?? null,
      trendUp: salesMonthTrend?.trendUp ?? true,
      description: "All-time revenue · month vs. last month",
    },
    {
      label: "Total Sold",
      value: totalSold.toLocaleString(),
      trend: soldMonthTrend?.label ?? null,
      trendUp: soldMonthTrend?.trendUp ?? true,
      description: "All-time units · month vs. last month",
    },
  ]
}

export function buildPeriodSummaries(
  sales: Sale[],
  expenses: Expense[],
  formatValue: (value: number) => string
): { monthly: DashboardPeriodSummary; yearly: DashboardPeriodSummary } {
  const today = todayIso()
  const thisMonth = getThisMonthRange(today)
  const lastMonth = getLastMonthRange(today)
  const thisYear = getThisYearRange(today)
  const lastYear = getLastYearRange(today)
  const monthLabel = formatMonthLabel(today)
  const yearLabel = formatYearLabel(today)

  return {
    monthly: buildPeriodSummary(
      "This month",
      `${monthLabel} · vs. last month`,
      {
        current: sumSalesInRange(sales, thisMonth.start, thisMonth.end),
        previous: sumSalesInRange(sales, lastMonth.start, lastMonth.end),
      },
      {
        current: sumExpensesInRange(expenses, thisMonth.start, thisMonth.end),
        previous: sumExpensesInRange(expenses, lastMonth.start, lastMonth.end),
      },
      formatValue
    ),
    yearly: buildPeriodSummary(
      "This year",
      `${yearLabel} YTD · vs. same period last year`,
      {
        current: sumSalesInRange(sales, thisYear.start, thisYear.end),
        previous: sumSalesInRange(sales, lastYear.start, lastYear.end),
      },
      {
        current: sumExpensesInRange(expenses, thisYear.start, thisYear.end),
        previous: sumExpensesInRange(expenses, lastYear.start, lastYear.end),
      },
      formatValue
    ),
  }
}

export function buildTopProducts(
  sales: Sale[],
  products: Product[],
  categories: ProductCategory[],
  limit = 4
): DashboardTopProduct[] {
  const today = todayIso()
  const thisMonth = getThisMonthRange(today)
  const totals = new Map<
    string,
    { quantity: number; revenue: number; orders: number }
  >()

  for (const sale of sales) {
    if (sale.date < thisMonth.start || sale.date > thisMonth.end) {
      continue
    }

    const current = totals.get(sale.productId) ?? {
      quantity: 0,
      revenue: 0,
      orders: 0,
    }
    totals.set(sale.productId, {
      quantity: current.quantity + sale.quantity,
      revenue: current.revenue + getSaleTotal(sale),
      orders: current.orders + 1,
    })
  }

  return [...totals.entries()]
    .map(([productId, stats]) => {
      const product = products.find((item) => item.id === productId)
      const category = categories.find((item) => item.id === product?.categoryId)

      return {
        productId,
        name: product?.name ?? "Unknown product",
        category: category?.name ?? "Uncategorized",
        price: product?.price ?? null,
        quantity: stats.quantity,
        revenue: stats.revenue,
        orders: stats.orders,
        avgOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0,
      }
    })
    .sort((a, b) => {
      if (b.quantity !== a.quantity) {
        return b.quantity - a.quantity
      }
      return b.revenue - a.revenue
    })
    .slice(0, limit)
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
