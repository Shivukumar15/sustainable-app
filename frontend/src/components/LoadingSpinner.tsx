export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600`} />
    </div>
  )
}
