export default function StatusBadge({ status }) {
  const statusConfig = {
    'Pending': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
    'In Progress': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    'Resolved': {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    'in_progress': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    'resolved': {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    'pending': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
  }

  const config = statusConfig[status] || statusConfig['pending']

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status}
    </span>
  )
}
