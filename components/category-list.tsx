"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

type Category = {
  id: string
  name: string
  color: string
  count: number
}

const initialCategories: Category[] = [
  { id: "1", name: "trabalho", color: "bg-cyan-500", count: 5 },
  { id: "2", name: "estudo", color: "bg-purple-500", count: 3 },
  { id: "3", name: "saúde", color: "bg-green-500", count: 2 },
  { id: "4", name: "lazer", color: "bg-yellow-500", count: 1 },
  { id: "5", name: "rotina", color: "bg-slate-500", count: 4 },
]

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between rounded-md border border-slate-800 p-2">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${category.color}`} />
            <span className="text-sm font-medium">{category.name}</span>
            <Badge variant="secondary" className="bg-slate-800 text-xs">
              {category.count}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit className="h-3 w-3" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600">
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
