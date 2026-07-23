"use client";

import * as React from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProductFormDialog,
  type ProductFormValues,
} from "@/components/products/product-form-dialog";
import {
  computeMarginPercent,
  computeProductCost,
  computeProductMargin,
  computeProductRecipeItemCost,
  computeRecipeItemCost,
  formatCurrency,
} from "@/lib/costing";
import { useCategories, useIngredients, useProducts } from "@/lib/data-provider";
import { getRecipeItemKey, isProductRecipeItem, formatProductRecipeQuantity } from "@/lib/recipe";
import type { Product } from "@/lib/types";
import { formatRecipeQuantity } from "@/lib/units";
import { usePagination } from "@/lib/use-pagination";
import { TablePagination } from "@/components/table-pagination";
import { ProductsPageSkeleton } from "@/components/page-skeletons";

export default function ProductsPage() {
  const { items: products, isLoading, add, update, remove } = useProducts();
  const { items: ingredients } = useIngredients();
  const { items: categories } = useCategories();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const categoryFilterItems = React.useMemo(
    () => [
      { label: "All categories", value: "all" },
      { label: "Uncategorized", value: "uncategorized" },
      ...categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [categories],
  );

  const filteredProducts = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) {
        return false;
      }

      if (categoryFilter === "all") {
        return true;
      }

      if (categoryFilter === "uncategorized") {
        return !product.categoryId && !product.special;
      }

      return product.categoryId === categoryFilter;
    });
  }, [products, searchQuery, categoryFilter]);

  const pagination = usePagination(filteredProducts, {
    resetKey: `${searchQuery}-${categoryFilter}`,
  });

  function handleAddClick() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function handleEditClick(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function handleSubmit(values: ProductFormValues) {
    if (editingProduct) {
      update(editingProduct.id, values);
      toast.success(`${values.name} updated`);
    } else {
      add(values);
      toast.success(`${values.name} added`);
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  if (isLoading) {
    return <ProductsPageSkeleton />;
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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search products by name"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              items={categoryFilterItems}
              value={categoryFilter}
              onValueChange={(value) =>
                setCategoryFilter((value as string | null) ?? "all")
              }
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent searchable searchPlaceholder="Search categories...">
                <SelectGroup>
                  {categoryFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Margin / Profit</TableHead>
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
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products match your search or filter.
                  </TableCell>
                </TableRow>
              ) : (
                pagination.paginatedItems.map((product) => {
                  const cost = computeProductCost(product, ingredients, products);
                  const marginPercent = computeMarginPercent(
                    product,
                    ingredients,
                    products,
                  );
                  const profit = computeProductMargin(
                    product,
                    ingredients,
                    products,
                  );
                  const category = categories.find(
                    (item) => item.id === product.categoryId,
                  );
                  const hasPrice = product.price != null && product.price > 0;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.name}
                          {product.special && (
                            <Badge variant="outline" className="text-[10px]">
                              Special
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category?.name ?? (product.special ? "—" : "Uncategorized")}
                      </TableCell>
                      <TableCell className="font-mono">
                        {hasPrice ? formatCurrency(product.price!) : "—"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(cost)}
                      </TableCell>
                      <TableCell>
                        {hasPrice ? (
                          <div className="flex items-center gap-2 font-mono text-sm">
                            <Badge
                              variant={
                                marginPercent >= 0 ? "secondary" : "destructive"
                              }
                            >
                              {marginPercent.toFixed(0)}%
                            </Badge>
                            <span
                              className={
                                profit < 0 ? "text-destructive" : "text-muted-foreground"
                              }
                            >
                              / {formatCurrency(profit)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger className="text-sm text-foreground underline-offset-4 hover:underline">
                            View ({product.recipe.length})
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <PopoverTitle>{product.name} recipe</PopoverTitle>
                            {product.recipe.length === 0 ? (
                              <p className="text-muted-foreground">
                                No recipe items set.
                              </p>
                            ) : (
                              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 gap-y-2 text-sm">
                                {product.recipe.map((item) => {
                                  const itemKey = getRecipeItemKey(item);

                                  if (isProductRecipeItem(item)) {
                                    const specialProduct = products.find(
                                      (p) => p.id === item.productId,
                                    );
                                    if (!specialProduct) return null;
                                    return (
                                      <React.Fragment key={itemKey}>
                                        <span className="leading-snug">
                                          {specialProduct.name}
                                          <Badge
                                            variant="outline"
                                            className="ml-2 align-middle text-[10px]"
                                          >
                                            Special
                                          </Badge>
                                        </span>
                                        <span className="font-mono text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                          {formatProductRecipeQuantity(
                                            item.quantity,
                                          )}
                                        </span>
                                        <span className="font-mono text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                          {formatCurrency(
                                            computeProductRecipeItemCost(
                                              item,
                                              specialProduct,
                                              ingredients,
                                              products,
                                            ),
                                          )}
                                        </span>
                                      </React.Fragment>
                                    );
                                  }

                                  const ingredient = ingredients.find(
                                    (i) => i.id === item.ingredientId,
                                  );
                                  if (!ingredient) return null;
                                  return (
                                    <React.Fragment key={itemKey}>
                                      <span className="leading-snug">
                                        {ingredient.name}
                                      </span>
                                      <span className="font-mono text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                        {formatRecipeQuantity(
                                          item,
                                          ingredient.unit,
                                        )}
                                      </span>
                                      <span className="font-mono text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                        {formatCurrency(
                                          computeRecipeItemCost(
                                            item,
                                            ingredient,
                                          ),
                                        )}
                                      </span>
                                    </React.Fragment>
                                  );
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
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setPage}
          />
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
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot; from
              your product list.
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
  );
}
