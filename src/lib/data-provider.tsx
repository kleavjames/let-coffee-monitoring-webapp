"use client"

import * as React from "react"

import {
  seedExpenses,
  seedIngredients,
  seedProducts,
  seedSales,
} from "@/lib/mock-data"
import type { Expense, Ingredient, IngredientUnit, Product, Sale } from "@/lib/types"
import { normalizeRecipeItem } from "@/lib/units"

const STORAGE_KEY = "let-coffee-tracker:data"

type LegacyIngredient = {
  id: string
  name: string
  unit: IngredientUnit
  costPerUnit?: number
  purchasePrice?: number
  packageQuantity?: number
  stockQuantity?: number
}

function normalizeIngredient(raw: LegacyIngredient): Ingredient {
  if (
    raw.purchasePrice !== undefined &&
    raw.packageQuantity !== undefined &&
    raw.packageQuantity > 0
  ) {
    return {
      id: raw.id,
      name: raw.name,
      unit: raw.unit,
      purchasePrice: raw.purchasePrice,
      packageQuantity: raw.packageQuantity,
      stockQuantity: raw.stockQuantity,
    }
  }

  const costPerUnit = raw.costPerUnit ?? 0
  const packageQuantity =
    raw.packageQuantity ??
    (raw.unit === "pcs" ? 100 : raw.unit === "pack" ? 1 : 1000)

  return {
    id: raw.id,
    name: raw.name,
    unit: raw.unit,
    purchasePrice: costPerUnit * packageQuantity,
    packageQuantity,
    stockQuantity: raw.stockQuantity,
  }
}

function normalizeProducts(
  products: Product[],
  ingredients: Ingredient[]
): Product[] {
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]))

  return products.map((product) => ({
    ...product,
    recipe: product.recipe.map((item) => {
      const ingredient = ingredientById.get(item.ingredientId)
      if (!ingredient) return item
      return normalizeRecipeItem(item, ingredient.unit)
    }),
  }))
}
type StoredData = {
  products: Product[]
  ingredients: Ingredient[]
  sales: Sale[]
  expenses: Expense[]
}

type AppDataContextValue = {
  products: Product[]
  ingredients: Ingredient[]
  sales: Sale[]
  expenses: Expense[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Omit<Product, "id">) => void
  removeProduct: (id: string) => void
  addIngredient: (ingredient: Omit<Ingredient, "id">) => void
  updateIngredient: (id: string, ingredient: Omit<Ingredient, "id">) => void
  removeIngredient: (id: string) => void
  addSale: (sale: Omit<Sale, "id">) => void
  removeSale: (id: string) => void
  addExpense: (expense: Omit<Expense, "id">) => void
  removeExpense: (id: string) => void
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>(seedProducts)
  const [ingredients, setIngredients] =
    React.useState<Ingredient[]>(seedIngredients)
  const [sales, setSales] = React.useState<Sale[]>(seedSales)
  const [expenses, setExpenses] = React.useState<Expense[]>(seedExpenses)
  const [hydrated, setHydrated] = React.useState(false)

  // Reading localStorage must happen client-side only, after the initial
  // (seed-data) render has hydrated, to avoid an SSR/client markup mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredData>
        const normalizedIngredients = parsed.ingredients
          ? parsed.ingredients.map(normalizeIngredient)
          : seedIngredients
        if (parsed.ingredients) {
          setIngredients(normalizedIngredients)
        }
        if (parsed.products) {
          setProducts(normalizeProducts(parsed.products, normalizedIngredients))
        }
        if (parsed.sales) setSales(parsed.sales)
        if (parsed.expenses) setExpenses(parsed.expenses)
      }
    } catch {
      // Ignore malformed localStorage data and fall back to seed data.
    } finally {
      setHydrated(true)
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (!hydrated) return
    const data: StoredData = { products, ingredients, sales, expenses }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Ignore write errors (e.g. storage quota, private mode).
    }
  }, [hydrated, products, ingredients, sales, expenses])

  const addProduct = React.useCallback((product: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...product, id: generateId("prod") }])
  }, [])

  const updateProduct = React.useCallback(
    (id: string, product: Omit<Product, "id">) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...product, id } : p))
      )
    },
    []
  )

  const removeProduct = React.useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addIngredient = React.useCallback(
    (ingredient: Omit<Ingredient, "id">) => {
      setIngredients((prev) => [
        ...prev,
        { ...ingredient, id: generateId("ing") },
      ])
    },
    []
  )

  const updateIngredient = React.useCallback(
    (id: string, ingredient: Omit<Ingredient, "id">) => {
      setIngredients((prev) =>
        prev.map((i) => (i.id === id ? { ...ingredient, id } : i))
      )
    },
    []
  )

  const removeIngredient = React.useCallback((id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const addSale = React.useCallback((sale: Omit<Sale, "id">) => {
    setSales((prev) => [{ ...sale, id: generateId("sale") }, ...prev])
  }, [])

  const removeSale = React.useCallback((id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addExpense = React.useCallback((expense: Omit<Expense, "id">) => {
    setExpenses((prev) => [{ ...expense, id: generateId("expense") }, ...prev])
  }, [])

  const removeExpense = React.useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      products,
      ingredients,
      sales,
      expenses,
      addProduct,
      updateProduct,
      removeProduct,
      addIngredient,
      updateIngredient,
      removeIngredient,
      addSale,
      removeSale,
      addExpense,
      removeExpense,
    }),
    [
      products,
      ingredients,
      sales,
      expenses,
      addProduct,
      updateProduct,
      removeProduct,
      addIngredient,
      updateIngredient,
      removeIngredient,
      addSale,
      removeSale,
      addExpense,
      removeExpense,
    ]
  )

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  )
}

function useAppData() {
  const context = React.useContext(AppDataContext)
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider")
  }
  return context
}

export function useProducts() {
  const { products, addProduct, updateProduct, removeProduct } = useAppData()
  return {
    items: products,
    add: addProduct,
    update: updateProduct,
    remove: removeProduct,
  }
}

export function useIngredients() {
  const { ingredients, addIngredient, updateIngredient, removeIngredient } =
    useAppData()
  return {
    items: ingredients,
    add: addIngredient,
    update: updateIngredient,
    remove: removeIngredient,
  }
}

export function useSales() {
  const { sales, addSale, removeSale } = useAppData()
  return { items: sales, add: addSale, remove: removeSale }
}

export function useExpenses() {
  const { expenses, addExpense, removeExpense } = useAppData()
  return { items: expenses, add: addExpense, remove: removeExpense }
}
