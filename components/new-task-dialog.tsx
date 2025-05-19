// components/new-task-dialog.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { TaskForm } from "@/components/task-form"
import { useRouter } from "next/navigation"

export function NewTaskDialog({ onTaskAdded }: { onTaskAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    
    // Forçar atualização dos dados
    if (onTaskAdded) {
      onTaskAdded();
    } else {
      // Atualizar a página atual
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
          aria-label="Nova tarefa"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>Adicione uma nova tarefa à sua lista.</DialogDescription>
        </DialogHeader>
        <TaskForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}