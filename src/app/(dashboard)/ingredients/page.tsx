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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  IngredientFormDialog,
  type IngredientFormValues,
} from "@/components/ingredients/ingredient-form-dialog"
import { formatCurrency, getIngredientCostDisplay } from "@/lib/costing"
import { useIngredients } from "@/lib/data-provider"
import type { Ingredient } from "@/lib/types"

export default function IngredientsPage() {
  const { items, add, update, remove } = useIngredients()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingIngredient, setEditingIngredient] =
    React.useState<Ingredient | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Ingredient | null>(
    null
  )

  function handleAddClick() {
    setEditingIngredient(null)
    setFormOpen(true)
  }

  function handleEditClick(ingredient: Ingredient) {
    setEditingIngredient(ingredient)
    setFormOpen(true)
  }

  function handleSubmit(values: IngredientFormValues) {
    if (editingIngredient) {
      update(editingIngredient.id, values)
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
          <CardTitle>Ingredients</CardTitle>
          <CardDescription>
            Manage the ingredients used across your product recipes.
          </CardDescription>
          <CardAction>
            <Button onClick={handleAddClick}>
              <Plus data-icon="inline-start" />
              Add Ingredient
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Cost per unit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No ingredients yet. Add your first one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((ingredient) => {
                  const costDisplay = getIngredientCostDisplay(ingredient)
                  return (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">
                      {ingredient.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ingredient.unit}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(costDisplay.cost)}
                      <span className="text-muted-foreground">
                        {" "}
                        / {costDisplay.unit}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">
                      {ingredient.stockQuantity !== undefined ? (
                        <>
                          {ingredient.stockQuantity.toLocaleString()}{" "}
                          {ingredient.unit}
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" />
                          }
                        >
                          <MoreHorizontal />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(ingredient)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(ingredient)}
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

      <IngredientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        ingredient={editingIngredient}
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
            <AlertDialogTitle>Delete ingredient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot;.
              Products using this ingredient in their recipe will keep the
              reference, but the cost calculation will no longer include it.
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
