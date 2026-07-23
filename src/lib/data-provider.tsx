"use client"

import { useCallback, useMemo } from "react"
import { useMutation, useQuery } from "convex/react"

import { api } from "../../convex/_generated/api"
import {
  toCategory,
  toCategoryDocId,
  toCategoryId,
  toExpense,
  toExpenseId,
  toIngredient,
  toIngredientId,
  toProduct,
  toProductId,
  toRecipeItemInput,
  toSale,
  toSaleId,
} from "@/lib/convex-mappers"
import type {
  Expense,
  Ingredient,
  Product,
  ProductCategory,
  Sale,
} from "@/lib/types"

export function useProducts() {
  const docs = useQuery(api.products.list)
  const create = useMutation(api.products.create)
  const update = useMutation(api.products.update)
  const remove = useMutation(api.products.remove)

  const items = useMemo(
    () => (docs ? docs.map(toProduct) : []),
    [docs]
  )

  const add = useCallback(
    (product: Omit<Product, "id">) => {
      void create({
        name: product.name,
        categoryId: toCategoryId(product.categoryId),
        price: product.price,
        status: product.status,
        special: product.special,
        recipe: product.recipe.map(toRecipeItemInput),
      })
    },
    [create]
  )

  const updateProduct = useCallback(
    (id: string, product: Omit<Product, "id">) => {
      void update({
        id: toProductId(id),
        name: product.name,
        categoryId: toCategoryId(product.categoryId),
        price: product.price,
        status: product.status,
        special: product.special,
        recipe: product.recipe.map(toRecipeItemInput),
      })
    },
    [update]
  )

  const removeProduct = useCallback(
    (id: string) => {
      void remove({ id: toProductId(id) })
    },
    [remove]
  )

  return {
    items,
    isLoading: docs === undefined,
    add,
    update: updateProduct,
    remove: removeProduct,
  }
}

export function useCategories() {
  const categoryDocs = useQuery(api.categories.list)
  const productDocs = useQuery(api.products.list)
  const create = useMutation(api.categories.create)
  const update = useMutation(api.categories.update)
  const remove = useMutation(api.categories.remove)

  const items = useMemo(
    () => (categoryDocs ? categoryDocs.map(toCategory) : []),
    [categoryDocs]
  )
  const products = useMemo(
    () => (productDocs ? productDocs.map(toProduct) : []),
    [productDocs]
  )

  const add = useCallback(
    (category: Omit<ProductCategory, "id">) => {
      void create({ name: category.name })
    },
    [create]
  )

  const updateCategory = useCallback(
    (id: string, category: Omit<ProductCategory, "id">) => {
      void update({ id: toCategoryDocId(id), name: category.name })
    },
    [update]
  )

  const removeCategory = useCallback(
    (id: string) => {
      void remove({ id: toCategoryDocId(id) })
    },
    [remove]
  )

  return {
    items,
    products,
    isLoading: categoryDocs === undefined || productDocs === undefined,
    add,
    update: updateCategory,
    remove: removeCategory,
  }
}

export function useIngredients() {
  const docs = useQuery(api.ingredients.list)
  const create = useMutation(api.ingredients.create)
  const update = useMutation(api.ingredients.update)
  const remove = useMutation(api.ingredients.remove)

  const items = useMemo(
    () => (docs ? docs.map(toIngredient) : []),
    [docs]
  )

  const add = useCallback(
    (ingredient: Omit<Ingredient, "id">) => {
      void create({
        name: ingredient.name,
        unit: ingredient.unit,
        purchasePrice: ingredient.purchasePrice,
        packageQuantity: ingredient.packageQuantity,
        stockQuantity: ingredient.stockQuantity,
      })
    },
    [create]
  )

  const updateIngredient = useCallback(
    (id: string, ingredient: Omit<Ingredient, "id">) => {
      void update({
        id: toIngredientId(id),
        name: ingredient.name,
        unit: ingredient.unit,
        purchasePrice: ingredient.purchasePrice,
        packageQuantity: ingredient.packageQuantity,
        stockQuantity: ingredient.stockQuantity,
      })
    },
    [update]
  )

  const removeIngredient = useCallback(
    (id: string) => {
      void remove({ id: toIngredientId(id) })
    },
    [remove]
  )

  return {
    items,
    isLoading: docs === undefined,
    add,
    update: updateIngredient,
    remove: removeIngredient,
  }
}

export function useSales() {
  const docs = useQuery(api.sales.list)
  const create = useMutation(api.sales.create)
  const remove = useMutation(api.sales.remove)

  const items = useMemo(() => (docs ? docs.map(toSale) : []), [docs])

  const add = useCallback(
    (sale: Omit<Sale, "id">) => {
      void create({
        date: sale.date,
        productId: toProductId(sale.productId),
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
      })
    },
    [create]
  )

  const removeSale = useCallback(
    (id: string) => {
      void remove({ id: toSaleId(id) })
    },
    [remove]
  )

  return {
    items,
    isLoading: docs === undefined,
    add,
    remove: removeSale,
  }
}

export function useExpenses() {
  const docs = useQuery(api.expenses.list)
  const create = useMutation(api.expenses.create)
  const remove = useMutation(api.expenses.remove)

  const items = useMemo(
    () => (docs ? docs.map(toExpense) : []),
    [docs]
  )

  const add = useCallback(
    (expense: Omit<Expense, "id">) => {
      void create({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
      })
    },
    [create]
  )

  const removeExpense = useCallback(
    (id: string) => {
      void remove({ id: toExpenseId(id) })
    },
    [remove]
  )

  return {
    items,
    isLoading: docs === undefined,
    add,
    remove: removeExpense,
  }
}
