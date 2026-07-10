const STATS = [
  { value: '1 200+', label: 'виз выдано', color: 'text-primary' },
  { value: '98%', label: 'одобрений', color: 'text-secondary' },
  { value: '28', label: 'стран', color: 'text-foreground' },
  { value: '4.9★', label: 'рейтинг Google', color: 'text-yellow-500' },
]

export function SocialProof() {
  return (
    <section className="border-y border-border bg-card py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(stat => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className={`text-4xl font-bold md:text-5xl ${stat.color}`}>
                {stat.value}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
