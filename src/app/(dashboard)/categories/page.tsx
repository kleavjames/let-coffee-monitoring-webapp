"use client"

import * as React from "react"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CategoryFormDialog,
  type CategoryFormValues,
} from "@/components/categories/category-form-dialog"
import { useCategories } from "@/lib/data-provider"
import type { ProductCategory } from "@/lib/types"

export default function CategoriesPage() {
  const { items, products, add, update, remove } = useCategories()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] =
    React.useState<ProductCategory | null>(null)
  const [deleteTarget, setDeleteTarget] =
    React.useState<ProductCategory | null>(null)

  function handleAddClick() {
    setEditingCategory(null)
    setFormOpen(true)
  }

  function handleEditClick(category: ProductCategory) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  function handleSubmit(values: CategoryFormValues) {
    if (editingCategory) {
      update(editingCategory.id, values)
      toast.success(`${values.name} updated`)
      return
    }

    add(values)
    toast.success(`${values.name} added`)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return

    const productCount = products.filter(
      (product) => product.categoryId === deleteTarget.id
    ).length

    if (productCount > 0) {
      toast.error(
        `Cannot delete "${deleteTarget.name}" — ${productCount} product(s) still use it.`
      )
      setDeleteTarget(null)
      return
    }

    remove(deleteTarget.id)
    toast.success(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Group your products into categories like Hot Coffee or Iced Coffee.
          </CardDescription>
          <CardAction>
            <Button onClick={handleAddClick}>
              <Plus data-icon="inline-start" />
              Add Category
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No categories yet. Add your first one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((category) => {
                  const productCount = products.filter(
                    (product) => product.categoryId === category.id
                  ).length

                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {productCount}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                          >
                            <MoreHorizontal />
                            <span className="sr-only">Open menu</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(category)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(category)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot;.
              Categories with assigned products cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
