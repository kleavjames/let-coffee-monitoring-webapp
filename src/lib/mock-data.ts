import type { Expense, Ingredient, Product, Sale } from "@/lib/types"

export const seedIngredients: Ingredient[] = [
  {
    id: "ing-coffee-beans",
    name: "Coffee Beans",
    unit: "g",
    costPerUnit: 0.8,
    stockQuantity: 5000,
  },
  {
    id: "ing-milk",
    name: "Milk",
    unit: "ml",
    costPerUnit: 0.05,
    stockQuantity: 10000,
  },
  {
    id: "ing-sugar",
    name: "Sugar",
    unit: "g",
    costPerUnit: 0.02,
    stockQuantity: 8000,
  },
  {
    id: "ing-cup",
    name: "Cup (12oz)",
    unit: "pcs",
    costPerUnit: 5,
    stockQuantity: 500,
  },
  {
    id: "ing-choco-syrup",
    name: "Chocolate Syrup",
    unit: "ml",
    costPerUnit: 0.3,
    stockQuantity: 3000,
  },
  {
    id: "ing-ice",
    name: "Ice",
    unit: "g",
    costPerUnit: 0.01,
    stockQuantity: 20000,
  },
]

export const seedProducts: Product[] = [
  {
    id: "prod-espresso",
    name: "Espresso",
    category: "Hot Coffee",
    price: 85,
    status: "active",
    recipe: [
      { ingredientId: "ing-coffee-beans", quantity: 18 },
      { ingredientId: "ing-cup", quantity: 1 },
    ],
  },
  {
    id: "prod-americano",
    name: "Americano",
    category: "Hot Coffee",
    price: 95,
    status: "active",
    recipe: [
      { ingredientId: "ing-coffee-beans", quantity: 18 },
      { ingredientId: "ing-cup", quantity: 1 },
    ],
  },
  {
    id: "prod-latte",
    name: "Cafe Latte",
    category: "Hot Coffee",
    price: 120,
    status: "active",
    recipe: [
      { ingredientId: "ing-coffee-beans", quantity: 18 },
      { ingredientId: "ing-milk", quantity: 150 },
      { ingredientId: "ing-cup", quantity: 1 },
    ],
  },
  {
    id: "prod-cappuccino",
    name: "Cappuccino",
    category: "Hot Coffee",
    price: 120,
    status: "active",
    recipe: [
      { ingredientId: "ing-coffee-beans", quantity: 18 },
      { ingredientId: "ing-milk", quantity: 100 },
      { ingredientId: "ing-cup", quantity: 1 },
    ],
  },
  {
    id: "prod-mocha",
    name: "Cafe Mocha",
    category: "Hot Coffee",
    price: 130,
    status: "active",
    recipe: [
      { ingredientId: "ing-coffee-beans", quantity: 18 },
      { ingredientId: "ing-milk", quantity: 120 },
      { ingredientId: "ing-choco-syrup", quantity: 30 },
      { ingredientId: "ing-cup", quantity: 1 },
    ],
  },
  {
    id: "prod-iced-latte",
    name: "Iced Latte",
    category: "Iced Coffee",
    price: 130,
    status: "active",
    recipe: [
      { ingredientId: "ing-coffee-beans", quantity: 18 },
      { ingredientId: "ing-milk", quantity: 120 },
      { ingredientId: "ing-ice", quantity: 150 },
      { ingredientId: "ing-cup", quantity: 1 },
    ],
  },
]

function daysAgoIso(daysAgo: number) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

export const seedSales: Sale[] = [
  { id: "sale-1", date: daysAgoIso(0), productId: "prod-latte", quantity: 5, unitPrice: 120 },
  { id: "sale-2", date: daysAgoIso(0), productId: "prod-espresso", quantity: 3, unitPrice: 85 },
  { id: "sale-3", date: daysAgoIso(1), productId: "prod-cappuccino", quantity: 4, unitPrice: 120 },
  { id: "sale-4", date: daysAgoIso(1), productId: "prod-iced-latte", quantity: 6, unitPrice: 130 },
  { id: "sale-5", date: daysAgoIso(2), productId: "prod-mocha", quantity: 2, unitPrice: 130 },
  { id: "sale-6", date: daysAgoIso(2), productId: "prod-americano", quantity: 5, unitPrice: 95 },
  { id: "sale-7", date: daysAgoIso(3), productId: "prod-latte", quantity: 7, unitPrice: 120 },
  { id: "sale-8", date: daysAgoIso(4), productId: "prod-espresso", quantity: 4, unitPrice: 85 },
]

export const seedExpenses: Expense[] = [
  {
    id: "expense-1",
    date: daysAgoIso(1),
    category: "Ingredients",
    description: "Coffee beans restock (5kg)",
    amount: 2500,
  },
  {
    id: "expense-2",
    date: daysAgoIso(3),
    category: "Rent",
    description: "Stall rent - weekly",
    amount: 3000,
  },
  {
    id: "expense-3",
    date: daysAgoIso(4),
    category: "Utilities",
    description: "Electricity & water",
    amount: 800,
  },
]
