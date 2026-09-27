interface TopHeaderProps {
  offsetClassName: string
}

export function TopHeader({ offsetClassName }: TopHeaderProps) {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header
      className={`fixed right-0 top-0 z-10 hidden h-16 items-center border-b border-border bg-surface/80 px-6 backdrop-blur-md transition-all md:flex md:px-8 ${offsetClassName}`}
    >
      <span className="text-sm font-medium capitalize text-textSecondary">{today}</span>
    </header>
  )
}
