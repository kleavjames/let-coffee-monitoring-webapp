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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ProductFormDialog,
  type ProductFormValues,
} from "@/components/products/product-form-dialog"
import {
  computeMarginPercent,
  computeProductCost,
  formatCurrency,
} from "@/lib/costing"
import { useIngredients, useProducts } from "@/lib/data-provider"
import type { Product } from "@/lib/types"

export default function ProductsPage() {
  const { items: products, add, update, remove } = useProducts()
  const { items: ingredients } = useIngredients()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null)

  function handleAddClick() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function handleEditClick(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  function handleSubmit(values: ProductFormValues) {
    if (editingProduct) {
      update(editingProduct.id, values)
      toast.success(`${values.name} updated`)
    } else {
      add(values)
      toast.success(`${values.name} added`)
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    remove(deleteTarget.id)
    toast.success(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage what you sell, its price, and the recipe behind it.
          </CardDescription>
          <CardAction>
            <Button onClick={handleAddClick}>
              <Plus data-icon="inline-start" />
              Add Product
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Recipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products yet. Add your first one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const cost = computeProductCost(product, ingredients)
                  const marginPercent = computeMarginPercent(
                    product,
                    ingredients
                  )
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{formatCurrency(cost)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            marginPercent >= 0 ? "secondary" : "destructive"
                          }
                        >
                          {marginPercent.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger className="text-sm text-foreground underline-offset-4 hover:underline">
                            View ({product.recipe.length})
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverTitle>{product.name} recipe</PopoverTitle>
                            {product.recipe.length === 0 ? (
                              <p className="text-muted-foreground">
                                No ingredients set.
                              </p>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {product.recipe.map((item) => {
                                  const ingredient = ingredients.find(
                                    (i) => i.id === item.ingredientId
                                  )
                                  if (!ingredient) return null
                                  return (
                                    <div
                                      key={item.ingredientId}
                                      className="flex items-center justify-between gap-2"
                                    >
                                      <span>{ingredient.name}</span>
                                      <span className="text-muted-foreground">
                                        {item.quantity} {ingredient.unit} ·{" "}
                                        {formatCurrency(
                                          ingredient.costPerUnit *
                                            item.quantity
                                        )}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {product.status}
                        </Badge>
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
                              onClick={() => handleEditClick(product)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(product)}
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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
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
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot;
              from your product list.
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
