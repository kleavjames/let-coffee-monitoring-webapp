"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SummaryCardsGrid } from "@/components/summary-cards-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ExpenseFormDialog,
  type ExpenseFormValues,
} from "@/components/sales/expense-form-dialog"
import {
  SaleFormDialog,
  type SaleFormValues,
} from "@/components/sales/sale-form-dialog"
import { formatCurrency, getSaleTotal } from "@/lib/costing"
import { useExpenses, useProducts, useSales } from "@/lib/data-provider"
import { usePagination } from "@/lib/use-pagination"
import { TablePagination } from "@/components/table-pagination"
import {
  ExpensesTableSkeleton,
  SalesTableSkeleton,
} from "@/components/page-skeletons"
import { Skeleton } from "@/components/ui/skeleton"
import {
  buildSoldSummary,
  getDateFilterRange,
  type DateFilterPreset,
} from "@/lib/dashboard-stats"

const DATE_FILTER_LABELS: Record<DateFilterPreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  week: "This week",
  all: "All",
}

function DateFilterTabs({
  value,
  onValueChange,
  className,
}: {
  value: DateFilterPreset
  onValueChange: (value: DateFilterPreset) => void
  className?: string
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as DateFilterPreset)}
      className={className}
    >
      <TabsList>
        {Object.entries(DATE_FILTER_LABELS).map(([preset, label]) => (
          <TabsTrigger key={preset} value={preset}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

function matchesDateRange(
  date: string,
  range: { start: string; end: string } | null
): boolean {
  if (!range) return true
  return date >= range.start && date <= range.end
}

export default function SalesPage() {
  const { items: sales, isLoading: salesLoading, add: addSale, remove: removeSale } =
    useSales()
  const {
    items: expenses,
    isLoading: expensesLoading,
    add: addExpense,
    remove: removeExpense,
  } = useExpenses()
  const { items: products } = useProducts()
  const [saleFormOpen, setSaleFormOpen] = React.useState(false)
  const [expenseFormOpen, setExpenseFormOpen] = React.useState(false)
  const [datePreset, setDatePreset] = React.useState<DateFilterPreset>("all")

  const dateRange = React.useMemo(
    () => getDateFilterRange(datePreset),
    [datePreset]
  )

  const filteredSales = React.useMemo(
    () => sales.filter((sale) => matchesDateRange(sale.date, dateRange)),
    [sales, dateRange]
  )
  const filteredExpenses = React.useMemo(
    () =>
      expenses.filter((expense) => matchesDateRange(expense.date, dateRange)),
    [expenses, dateRange]
  )

  const sortedSales = [...filteredSales].sort((a, b) =>
    a.date < b.date ? 1 : -1
  )
  const sortedExpenses = [...filteredExpenses].sort((a, b) =>
    a.date < b.date ? 1 : -1
  )
  const salesPagination = usePagination(sortedSales, {
    resetKey: datePreset,
  })
  const expensesPagination = usePagination(sortedExpenses, {
    resetKey: datePreset,
  })

  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + getSaleTotal(sale),
    0
  )
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const hasDateFilter = datePreset !== "all"
  const dateFilterLabel = DATE_FILTER_LABELS[datePreset].toLowerCase()

  const soldSummaryCards = React.useMemo(
    () => buildSoldSummary(sales, formatCurrency),
    [sales]
  )

  function handleAddSale(values: SaleFormValues[]) {
    for (const sale of values) {
      addSale(sale)
    }
    toast.success(
      values.length === 1 ? "Sale logged" : `${values.length} sales logged`
    )
  }

  function handleAddExpense(values: ExpenseFormValues) {
    addExpense(values)
    toast.success("Expense added")
  }

  function handleRemoveSale(id: string) {
    removeSale(id)
    toast.success("Sale removed")
  }

  function handleRemoveExpense(id: string) {
    removeExpense(id)
    toast.success("Expense removed")
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        {salesLoading ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`sold-summary-skeleton-${index}`} className="flex-1">
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <SummaryCardsGrid
            cards={soldSummaryCards}
            className="mt-4 flex flex-col gap-4 sm:flex-row *:flex-1"
          />
        )}

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales</CardTitle>
              <CardDescription>
                {salesLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <>
                    {sortedSales.length} record(s)
                    {hasDateFilter ? ` · ${dateFilterLabel}` : ""} · Total{" "}
                    <span className="font-mono">{formatCurrency(totalSales)}</span>
                  </>
                )}
              </CardDescription>
              <CardAction>
                <Button onClick={() => setSaleFormOpen(true)}>
                  <Plus data-icon="inline-start" />
                  Log Sale
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DateFilterTabs
                value={datePreset}
                onValueChange={setDatePreset}
                className="mb-4"
              />
              {salesLoading ? (
                <SalesTableSkeleton />
              ) : (
                <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {sales.length === 0
                            ? "No sales logged yet."
                            : "No sales match the selected date filter."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesPagination.paginatedItems.map((sale) => {
                        const product = products.find(
                          (p) => p.id === sale.productId
                        )
                        return (
                          <TableRow key={sale.id}>
                            <TableCell className="font-mono text-muted-foreground">
                              {sale.date}
                            </TableCell>
                            <TableCell className="font-medium">
                              {product?.name ?? "Unknown product"}
                            </TableCell>
                            <TableCell className="font-mono">
                              {sale.quantity}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatCurrency(sale.unitPrice)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatCurrency(getSaleTotal(sale))}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemoveSale(sale.id)}
                              >
                                <Trash2 />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  page={salesPagination.page}
                  pageSize={salesPagination.pageSize}
                  totalItems={salesPagination.totalItems}
                  totalPages={salesPagination.totalPages}
                  onPageChange={salesPagination.setPage}
                />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                {expensesLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <>
                    {sortedExpenses.length} record(s)
                    {hasDateFilter ? ` · ${dateFilterLabel}` : ""} · Total{" "}
                    <span className="font-mono">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </>
                )}
              </CardDescription>
              <CardAction>
                <Button onClick={() => setExpenseFormOpen(true)}>
                  <Plus data-icon="inline-start" />
                  Add Expense
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DateFilterTabs
                value={datePreset}
                onValueChange={setDatePreset}
                className="mb-4"
              />
              {expensesLoading ? (
                <ExpensesTableSkeleton />
              ) : (
                <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {expenses.length === 0
                            ? "No expenses recorded yet."
                            : "No expenses match the selected date filter."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      expensesPagination.paginatedItems.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-mono text-muted-foreground">
                            {expense.date}
                          </TableCell>
                          <TableCell className="font-medium">
                            {expense.category}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {expense.description}
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveExpense(expense.id)}
                            >
                              <Trash2 />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  page={expensesPagination.page}
                  pageSize={expensesPagination.pageSize}
                  totalItems={expensesPagination.totalItems}
                  totalPages={expensesPagination.totalPages}
                  onPageChange={expensesPagination.setPage}
                />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SaleFormDialog
        open={saleFormOpen}
        onOpenChange={setSaleFormOpen}
        onSubmit={handleAddSale}
      />
      <ExpenseFormDialog
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        onSubmit={handleAddExpense}
      />
    </div>
  )
}
