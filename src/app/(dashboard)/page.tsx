"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/costing"

const summaryCards = [
  {
    label: "Today's Sales",
    value: formatCurrency(1850),
    trend: "+12.5%",
    trendUp: true,
    description: "vs. yesterday",
  },
  {
    label: "This Week's Revenue",
    value: formatCurrency(12480),
    trend: "+8.1%",
    trendUp: true,
    description: "vs. last week",
  },
  {
    label: "Total Expenses",
    value: formatCurrency(6300),
    trend: "-3.2%",
    trendUp: false,
    description: "vs. last week",
  },
  {
    label: "Net Profit",
    value: formatCurrency(6180),
    trend: "+15.4%",
    trendUp: true,
    description: "vs. last week",
  },
]

const salesChartData = [
  { date: "Jul 10", sales: 1120 },
  { date: "Jul 11", sales: 1340 },
  { date: "Jul 12", sales: 980 },
  { date: "Jul 13", sales: 1560 },
  { date: "Jul 14", sales: 1890 },
  { date: "Jul 15", sales: 1420 },
  { date: "Jul 16", sales: 1750 },
  { date: "Jul 17", sales: 2010 },
  { date: "Jul 18", sales: 1680 },
  { date: "Jul 19", sales: 1930 },
  { date: "Jul 20", sales: 2210 },
  { date: "Jul 21", sales: 1990 },
  { date: "Jul 22", sales: 1740 },
  { date: "Jul 23", sales: 1850 },
]

const salesChartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const recentSales = [
  { id: 1, product: "Cafe Latte", quantity: 5, total: 600, date: "Today, 10:24 AM" },
  { id: 2, product: "Espresso", quantity: 3, total: 255, date: "Today, 9:58 AM" },
  { id: 3, product: "Iced Latte", quantity: 6, total: 780, date: "Today, 9:30 AM" },
  { id: 4, product: "Cappuccino", quantity: 4, total: 480, date: "Yesterday, 4:12 PM" },
  { id: 5, product: "Cafe Mocha", quantity: 2, total: 260, date: "Yesterday, 2:05 PM" },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant={card.trendUp ? "secondary" : "destructive"}>
                  {card.trendUp ? (
                    <ArrowUpRight data-icon="inline-start" />
                  ) : (
                    <ArrowDownRight data-icon="inline-start" />
                  )}
                  {card.trend}
                </Badge>
              </CardAction>
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
          <CardDescription>Last 14 days · sample data</CardDescription>
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
          <CardDescription>Sample data · latest transactions</CardDescription>
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
              {recentSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.product}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {sale.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="size-4" />
        Dashboard numbers are sample data for now — this will be wired up to
        real sales once you start logging them.
      </div>
    </div>
  )
}
