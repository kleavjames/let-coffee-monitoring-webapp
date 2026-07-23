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
import { formatCurrency } from "@/lib/costing"
import { useExpenses, useProducts, useSales } from "@/lib/data-provider"
import {
  ExpensesTableSkeleton,
  SalesTableSkeleton,
} from "@/components/page-skeletons"
import { Skeleton } from "@/components/ui/skeleton"

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

  const sortedSales = [...sales].sort((a, b) => (a.date < b.date ? 1 : -1))
  const sortedExpenses = [...expenses].sort((a, b) =>
    a.date < b.date ? 1 : -1
  )

  const totalSales = sales.reduce(
    (sum, sale) => sum + sale.quantity * sale.unitPrice,
    0
  )
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  function handleAddSale(values: SaleFormValues) {
    addSale(values)
    toast.success("Sale logged")
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

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales</CardTitle>
              <CardDescription>
                {salesLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <>
                    {sortedSales.length} record(s) · Total{" "}
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
              {salesLoading ? (
                <SalesTableSkeleton />
              ) : (
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
                          No sales logged yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedSales.map((sale) => {
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
                              {formatCurrency(sale.quantity * sale.unitPrice)}
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
                    {sortedExpenses.length} record(s) · Total{" "}
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
              {expensesLoading ? (
                <ExpensesTableSkeleton />
              ) : (
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
                          No expenses recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedExpenses.map((expense) => (
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
