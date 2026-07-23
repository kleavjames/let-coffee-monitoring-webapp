"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DashboardSkeleton } from "@/components/page-skeletons"
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
  buildRecentSales,
  buildSalesChartData,
} from "@/lib/dashboard-stats"
import { formatCurrency } from "@/lib/costing"
import { useExpenses, useProducts, useSales } from "@/lib/data-provider"

const salesChartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const { items: sales, isLoading: salesLoading } = useSales()
  const { items: expenses, isLoading: expensesLoading } = useExpenses()
  const { items: products, isLoading: productsLoading } = useProducts()

  const isLoading = salesLoading || expensesLoading || productsLoading

  const summaryCards = useMemo(
    () => buildDashboardSummary(sales, expenses, formatCurrency),
    [sales, expenses]
  )
  const salesChartData = useMemo(() => buildSalesChartData(sales), [sales])
  const recentSales = useMemo(
    () => buildRecentSales(sales, products),
    [sales, products]
  )

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="font-mono text-2xl font-semibold tracking-tight">
                {card.value}
              </CardTitle>
              {card.trend ? (
                <CardAction>
                  <Badge variant={card.trendUp ? "secondary" : "destructive"}>
                    {card.trendUp ? (
                      <ArrowUpRight data-icon="inline-start" />
                    ) : (
                      <ArrowDownRight data-icon="inline-start" />
                    )}
                    <span className="font-mono">{card.trend}</span>
                  </Badge>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {card.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales per day</CardTitle>
          <CardDescription>Last 14 days from logged sales</CardDescription>
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
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="sales"
                type="natural"
                fill="url(#fillSales)"
                stroke="var(--color-sales)"
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
