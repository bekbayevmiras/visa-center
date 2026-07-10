import { Settings, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

function maskPhone(phone: string | undefined): string {
  if (!phone) return 'не задан'
  // Show first 4 and last 2 chars, mask the middle
  if (phone.length <= 6) return phone
  return phone.slice(0, 4) + '*'.repeat(phone.length - 6) + phone.slice(-2)
}

function maskId(id: string | undefined): string {
  if (!id) return 'не задан'
  if (id.length <= 4) return '****'
  return id.slice(0, 3) + '*'.repeat(Math.max(id.length - 5, 4)) + id.slice(-2)
}

export default function AdminSettingsPage() {
  const kaspiPhone = process.env.NEXT_PUBLIC_KASPI_PHONE
  const kaspiMerchantId = process.env.NEXT_PUBLIC_KASPI_MERCHANT_ID

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-sm text-muted-foreground">Конфигурация платёжной системы Kaspi Pay</p>
        </div>
      </div>

      {/* Current env var values */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Текущие значения</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium font-mono">NEXT_PUBLIC_KASPI_PHONE</p>
              <p className="text-xs text-muted-foreground">Номер Kaspi для получения платежей</p>
            </div>
            <div className="flex items-center gap-2">
              {kaspiPhone ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="text-sm font-mono text-muted-foreground">
                {kaspiPhone ? maskPhone(kaspiPhone) : 'не задан'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm font-medium font-mono">NEXT_PUBLIC_KASPI_MERCHANT_ID</p>
              <p className="text-xs text-muted-foreground">ID мерчанта для Kaspi QR (получить в business.kaspi.kz)</p>
            </div>
            <div className="flex items-center gap-2">
              {kaspiMerchantId ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span className="text-sm font-mono text-muted-foreground">
                {kaspiMerchantId ? maskId(kaspiMerchantId) : 'не задан'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Setup instructions */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Как подключить Kaspi Pay</h2>
        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</span>
            <div>
              <p className="font-medium">Зарегистрируйтесь в Kaspi Business</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Перейдите на{' '}
                <a
                  href="https://business.kaspi.kz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  business.kaspi.kz
                  <ExternalLink className="h-3 w-3" />
                </a>{' '}
                и создайте бизнес-аккаунт.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">2</span>
            <div>
              <p className="font-medium">Получите QR-код или Merchant ID</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                В личном кабинете Kaspi Business скачайте статический QR-код или скопируйте ваш Merchant ID.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">3</span>
            <div>
              <p className="font-medium">Задайте переменные окружения</p>
              <p className="text-muted-foreground text-xs mt-0.5 mb-2">
                Добавьте в файл <code className="bg-muted px-1 py-0.5 rounded text-xs">.env.local</code> или в настройки хостинга:
              </p>
              <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto leading-relaxed">
{`NEXT_PUBLIC_KASPI_PHONE="+7 (XXX) XXX-XX-XX"
NEXT_PUBLIC_KASPI_MERCHANT_ID="ваш_merchant_id"`}
              </pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">4</span>
            <div>
              <p className="font-medium">Перезапустите сервер</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                После изменения переменных окружения перезапустите Next.js-сервер, чтобы изменения вступили в силу.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* Current status banner */}
      {!kaspiPhone && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Kaspi Pay не настроен</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Задайте переменную <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">NEXT_PUBLIC_KASPI_PHONE</code> для отображения реального номера клиентам.
              Сейчас показывается номер-заглушка.
            </p>
          </div>
        </div>
      )}

      {kaspiPhone && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Kaspi Pay настроен</p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
              Номер телефона задан и отображается клиентам на странице оплаты.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
