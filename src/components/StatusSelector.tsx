import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useUpsertShowStatus } from '@/lib/queries/userShows'
import { SHOW_STATUS_OPTIONS, type ShowStatus } from '@/types/db'

export function StatusSelector({
  tmdbShowId,
  currentStatus,
}: {
  tmdbShowId: number
  currentStatus?: ShowStatus
}) {
  const upsertStatus = useUpsertShowStatus()

  return (
    <ToggleGroup
      type="single"
      value={currentStatus ?? ''}
      onValueChange={(value) => {
        if (value) upsertStatus.mutate({ tmdbShowId, status: value as ShowStatus })
      }}
    >
      {SHOW_STATUS_OPTIONS.map((opt) => (
        <ToggleGroupItem key={opt.value} value={opt.value}>
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
