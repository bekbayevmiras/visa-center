import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-9xl font-extrabold text-primary leading-none select-none">404</p>
      <h1 className="mt-6 text-2xl font-bold text-foreground">Страница не найдена</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Возможно, ссылка устарела или вы опечатались
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          На главную
        </Link>
        <Link
          href="/countries"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Смотреть все страны
        </Link>
      </div>

      <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Главная
        </Link>
        <Link href="/countries" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Страны
        </Link>
        <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Цены
        </Link>
        <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          О нас
        </Link>
      </nav>
    </div>
  )
}
