import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardSummaryCard } from "@/lib/dashboard-stats"

export function SummaryCardsGrid({
  cards,
  className,
}: {
  cards: DashboardSummaryCard[]
  className?: string
}) {
  return (
    <div
      className={
        className ?? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="font-mono text-2xl font-semibold tracking-tight">
              {card.value}
            </CardTitle>
            {card.trend ? (
              <CardAction>
                <Badge variant={card.trendUp ? "secondary" : "destructive"}>
                  {card.trendUp ? (
                    <ArrowUpRight data-icon="inline-start" />
                  ) : (
                    <ArrowDownRight data-icon="inline-start" />
                  )}
                  <span className="font-mono">{card.trend}</span>
                </Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {card.description}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
