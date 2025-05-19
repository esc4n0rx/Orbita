// components/empty-state.tsx
import { Button } from "@/components/ui/button";
import { CheckCircle, ClipboardList } from "lucide-react";

type EmptyStateProps = {
  type: "tarefas" | "categorias" | "tags" | "estatisticas";
  action?: () => void;
};

export function EmptyState({ type, action }: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case "tarefas":
        return {
          icon: <ClipboardList className="h-12 w-12 text-slate-400" />,
          title: "Sem tarefas",
          description: "Você ainda não possui tarefas. Adicione uma nova tarefa para começar.",
          buttonText: "Adicionar tarefa"
        };
      case "categorias":
        return {
          icon: <ClipboardList className="h-12 w-12 text-slate-400" />,
          title: "Sem categorias",
          description: "Você ainda não criou nenhuma categoria para organizar suas tarefas.",
          buttonText: "Criar categoria"
        };
      case "tags":
        return {
          icon: <ClipboardList className="h-12 w-12 text-slate-400" />,
          title: "Sem tags",
          description: "Você ainda não criou nenhuma tag para organizar suas tarefas.",
          buttonText: "Criar tag"
        };
      case "estatisticas":
        return {
          icon: <CheckCircle className="h-12 w-12 text-slate-400" />,
          title: "Sem dados de estatísticas",
          description: "Complete tarefas para visualizar suas estatísticas de desempenho.",
          buttonText: "Ver tarefas"
        };
      default:
        return {
          icon: <ClipboardList className="h-12 w-12 text-slate-400" />,
          title: "Sem dados",
          description: "Nenhum dado encontrado.",
          buttonText: "Voltar"
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {content.icon}
      <h3 className="mt-4 text-xl font-medium">{content.title}</h3>
      <p className="mt-2 max-w-xs text-sm text-slate-400">{content.description}</p>
      {action && (
        <Button onClick={action} className="mt-4">
          {content.buttonText}
        </Button>
      )}
    </div>
  );
}