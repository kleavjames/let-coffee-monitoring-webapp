"use client"

import * as React from "react"

export const DEFAULT_PAGE_SIZE = 25

type UsePaginationOptions = {
  pageSize?: number
  resetKey?: string | number
}

export function usePagination<T>(
  items: T[],
  { pageSize = DEFAULT_PAGE_SIZE, resetKey }: UsePaginationOptions = {}
) {
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    setPage(1)
  }, [resetKey])

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const startIndex = (safePage - 1) * pageSize
  const paginatedItems = items.slice(startIndex, startIndex + pageSize)

  return {
    page: safePage,
    setPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
  }
}
