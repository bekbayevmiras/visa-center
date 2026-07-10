import { KanbanBoard } from '@/components/admin/KanbanBoard'

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Канбан-доска</h1>
        <p className="text-muted-foreground mt-1">Перетащите карточки между колонками для смены статуса</p>
      </div>
      <KanbanBoard />
    </div>
  )
}
