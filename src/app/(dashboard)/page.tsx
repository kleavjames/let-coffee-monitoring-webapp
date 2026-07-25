"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DashboardSkeleton } from "@/components/page-skeletons"
import { SummaryCardsGrid } from "@/components/summary-cards-grid"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildDashboardSummary,
  buildPeriodSummaries,
  buildRecentSales,
  buildSalesChartData,
  buildTopProducts,
  type DashboardPeriodMetric,
  type DashboardPeriodSummary,
} from "@/lib/dashboard-stats"
import { formatCurrency } from "@/lib/costing"
import { useCategories, useExpenses, useProducts, useSales } from "@/lib/data-provider"

const salesChartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function PeriodMetricRow({ metric }: { metric: DashboardPeriodMetric }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <p className="font-mono text-xl font-semibold tracking-tight">
          {metric.value}
        </p>
      </div>
      {metric.trend ? (
        <Badge
          variant={metric.trendUp ? "secondary" : "destructive"}
          className="shrink-0"
        >
          {metric.trendUp ? (
            <ArrowUpRight data-icon="inline-start" />
          ) : (
            <ArrowDownRight data-icon="inline-start" />
          )}
          <span className="font-mono">{metric.trend}</span>
        </Badge>
      ) : null}
    </div>
  )
}

function PeriodSummaryCard({ summary }: { summary: DashboardPeriodSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{summary.title}</CardTitle>
        <CardDescription>{summary.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <PeriodMetricRow metric={summary.sales} />
        <PeriodMetricRow metric={summary.expenses} />
        <div className="border-t border-border/70 pt-3">
          <PeriodMetricRow metric={summary.net} />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { items: sales, isLoading: salesLoading } = useSales()
  const { items: expenses, isLoading: expensesLoading } = useExpenses()
  const { items: products, isLoading: productsLoading } = useProducts()
  const { items: categories, isLoading: categoriesLoading } = useCategories()

  const isLoading =
    salesLoading || expensesLoading || productsLoading || categoriesLoading

  const summaryCards = useMemo(
    () => buildDashboardSummary(sales, expenses, formatCurrency),
    [sales, expenses]
  )
  const periodSummaries = useMemo(
    () => buildPeriodSummaries(sales, expenses, formatCurrency),
    [sales, expenses]
  )
  const topProducts = useMemo(
    () => buildTopProducts(sales, products, categories),
    [sales, products, categories]
  )
  const salesChartData = useMemo(
    () => buildSalesChartData(sales, expenses),
    [sales, expenses]
  )
  const recentSales = useMemo(
    () => buildRecentSales(sales, products),
    [sales, products]
  )

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <SummaryCardsGrid cards={summaryCards} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PeriodSummaryCard summary={periodSummaries.monthly} />
        <PeriodSummaryCard summary={periodSummaries.yearly} />

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Top sellers</CardTitle>
            <CardDescription>This month by quantity sold</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No sales logged this month yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {topProducts.map((product) => (
                  <li
                    key={product.productId}
                    className="truncate text-sm"
                    title={`${product.name} · ${product.category} · ${product.quantity} sold · ${formatCurrency(product.revenue)}`}
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {product.category} ·{" "}
                    </span>
                    <span className="font-mono">
                      {product.quantity.toLocaleString()} sold ·{" "}
                      {formatCurrency(product.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex justify-end pt-4">
              <Button variant="ghost" size="sm" render={<Link href="/sales" />}>
                View sales
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales per day</CardTitle>
          <CardDescription>
            Last 14 days from logged sales and expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={salesChartConfig}
            className="aspect-auto h-[260px] w-full"
          >
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-sales)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-sales)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-expenses)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-expenses)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="sales"
                type="natural"
                fill="url(#fillSales)"
                stroke="var(--color-sales)"
              />
              <Area
                dataKey="expenses"
                type="natural"
                fill="url(#fillExpenses)"
                stroke="var(--color-expenses)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest logged transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No sales logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.product}</TableCell>
                    <TableCell className="font-mono">{sale.quantity}</TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {sale.date}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
