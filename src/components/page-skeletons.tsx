import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const pageClassName = "flex flex-col gap-4 lg:gap-6"

function CardHeaderSkeleton({
  titleWidth = "w-28",
  descriptionWidth = "w-72",
  actionWidth = "w-32",
}: {
  titleWidth?: string
  descriptionWidth?: string
  actionWidth?: string
}) {
  return (
    <CardHeader>
      <Skeleton className={`h-5 ${titleWidth} max-w-full`} />
      <Skeleton className={`h-4 ${descriptionWidth} max-w-full`} />
      <CardAction>
        <Skeleton className={`h-8 ${actionWidth}`} />
      </CardAction>
    </CardHeader>
  )
}

function FilterBarSkeleton() {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 w-full sm:w-52" />
    </div>
  )
}

function TableSkeleton({
  headers,
  rows = 6,
  cellWidths,
}: {
  headers: string[]
  rows?: number
  cellWidths?: string[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead
              key={header}
              className={index === headers.length - 1 ? "w-10" : undefined}
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={`loading-${rowIndex}`}>
            {headers.map((header, colIndex) => (
              <TableCell
                key={`${header}-${rowIndex}`}
                className={colIndex === headers.length - 1 ? "w-10" : undefined}
              >
                <Skeleton
                  className={`h-4 ${cellWidths?.[colIndex] ?? "w-full max-w-32"}`}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function ProductsPageSkeleton() {
  return (
    <div className={pageClassName}>
      <Card>
        <CardHeaderSkeleton
          titleWidth="w-24"
          descriptionWidth="w-80"
          actionWidth="w-32"
        />
        <CardContent>
          <FilterBarSkeleton />
          <TableSkeleton
            headers={[
              "Name",
              "Category",
              "Price",
              "Cost",
              "Margin / Profit",
              "Recipe",
              "Status",
              "",
            ]}
            rows={6}
            cellWidths={[
              "w-36",
              "w-24",
              "w-16",
              "w-16",
              "w-28",
              "w-16",
              "w-16",
              "w-8",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function IngredientsPageSkeleton() {
  return (
    <div className={pageClassName}>
      <Card>
        <CardHeaderSkeleton
          titleWidth="w-28"
          descriptionWidth="w-96"
          actionWidth="w-36"
        />
        <CardContent>
          <FilterBarSkeleton />
          <TableSkeleton
            headers={["Name", "Unit", "Cost per unit", "Stock", ""]}
            rows={6}
            cellWidths={["w-40", "w-14", "w-28", "w-20", "w-8"]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export function CategoriesPageSkeleton() {
  return (
    <div className={pageClassName}>
      <Card>
        <CardHeaderSkeleton
          titleWidth="w-28"
          descriptionWidth="w-[28rem]"
          actionWidth="w-32"
        />
        <CardContent>
          <TableSkeleton
            headers={["Name", "Products", ""]}
            rows={5}
            cellWidths={["w-40", "w-12", "w-8"]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SalesCardSkeleton({
  actionWidth,
  headers,
  cellWidths,
}: {
  actionWidth: string
  headers: string[]
  cellWidths: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-48 max-w-full" />
        <CardAction>
          <Skeleton className={`h-8 ${actionWidth}`} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <TableSkeleton headers={headers} rows={6} cellWidths={cellWidths} />
      </CardContent>
    </Card>
  )
}

export function SalesPageSkeleton() {
  return (
    <div className={pageClassName}>
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <SalesCardSkeleton
            actionWidth="w-28"
            headers={["Date", "Product", "Quantity", "Unit price", "Total", ""]}
            cellWidths={["w-24", "w-36", "w-12", "w-20", "w-20", "w-8"]}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <SalesCardSkeleton
            actionWidth="w-32"
            headers={["Date", "Category", "Description", "Amount", ""]}
            cellWidths={["w-24", "w-24", "w-48", "w-20", "w-8"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function SalesTableSkeleton() {
  return (
    <TableSkeleton
      headers={["Date", "Product", "Quantity", "Unit price", "Total", ""]}
      rows={6}
      cellWidths={["w-24", "w-36", "w-12", "w-20", "w-20", "w-8"]}
    />
  )
}

export function ExpensesTableSkeleton() {
  return (
    <TableSkeleton
      headers={["Date", "Category", "Description", "Amount", ""]}
      rows={6}
      cellWidths={["w-24", "w-24", "w-48", "w-20", "w-8"]}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className={pageClassName}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`summary-${index}`}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <CardAction>
                <Skeleton className="h-5 w-16" />
              </CardAction>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <TableSkeleton
            headers={["Product", "Quantity", "Total", "Date"]}
            rows={5}
            cellWidths={["w-36", "w-12", "w-20", "w-32"]}
          />
        </CardContent>
      </Card>

      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  )
}
