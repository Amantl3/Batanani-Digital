import { cn } from '@/utils/cn'
import { formatStatus } from '@/utils/formatters'

const BADGE: Record<string, string> = {
  active:'badge-success', operational:'badge-success', resolved:'badge-success', approved:'badge-success',
  pending:'badge-warning', in_review:'badge-warning', maintenance:'badge-info',
  escalated:'badge-purple', submitted:'badge-info',
  expired:'badge-muted', closed:'badge-muted', draft:'badge-muted',
  suspended:'badge-danger', down:'badge-danger', rejected:'badge-danger',
}
const DOT: Record<string, string> = {
  active:'status-dot-up', operational:'status-dot-up', resolved:'status-dot-up', approved:'status-dot-up',
  pending:'status-dot-maint', in_review:'status-dot-maint', maintenance:'status-dot-maint',
  degraded:'status-dot-degraded',
  down:'status-dot-down', suspended:'status-dot-down', expired:'status-dot-down',
}

export default function StatusBadge({ status, showDot = true, className }: { status: string; showDot?: boolean; className?: string }) {
  return (
    <span className={cn('badge', BADGE[status] ?? 'badge-muted', className)}>
      {showDot && <span className={DOT[status] ?? 'status-dot'} />}
      {formatStatus(status)}
    </span>
  )
}
