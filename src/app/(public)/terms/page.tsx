import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Условия использования — VisaKZ',
  description: 'Условия использования сервиса VisaKZ — права и обязанности сторон, порядок оплаты и возврата средств.',
}

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Правовые документы
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-foreground">
            Условия использования
          </h1>
          <p className="text-muted-foreground">
            Редакция от <time dateTime="2026-07-10">10 июля 2026 г.</time>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-foreground">

          {/* 1 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">1. Общие положения</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                Настоящие Условия использования (далее — «Условия») регулируют отношения между VisaKZ (далее — «Сервис», «мы») и пользователями (далее — «Клиент», «вы») при использовании сайта visakz.kz и связанных услуг.
              </p>
              <p>
                Используя наш сервис, вы подтверждаете, что:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>вам исполнилось <strong className="text-foreground">18 лет</strong> или вы действуете с согласия законного представителя;</li>
                <li>вы являетесь <strong className="text-foreground">гражданином или резидентом Республики Казахстан</strong> либо законно находитесь на её территории;</li>
                <li>все данные, которые вы предоставляете, являются достоверными и актуальными.</li>
              </ul>
              <p>
                Начав использование сервиса, вы соглашаетесь с настоящими Условиями в полном объёме.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">2. Услуги</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>VisaKZ предоставляет следующие услуги:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>консультация по требованиям к документам для визы в выбранную страну;</li>
                <li>проверка комплекта документов с помощью AI-анализа;</li>
                <li>подготовка, заполнение и подача визовых анкет;</li>
                <li>сопровождение на всех этапах — от подачи заявки до получения визы;</li>
                <li>уведомления о статусе рассмотрения заявки.</li>
              </ul>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <p className="font-medium text-amber-800">Важно</p>
                <p className="mt-1 text-amber-700">
                  VisaKZ оказывает услуги по подготовке документов и подаче заявлений. Решение о выдаче или отказе в визе принимается исключительно посольством или консульством соответствующей страны. Мы <strong>не гарантируем</strong> положительное решение, однако прилагаем все усилия для подготовки максимально полного пакета документов.
                </p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">3. Стоимость и оплата</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                Стоимость услуг указана на странице{' '}
                <Link href="/prices" className="text-primary hover:underline">Прайс-лист</Link>{' '}
                и может различаться в зависимости от страны назначения, типа визы и срочности оформления.
              </p>
              <p>
                Оплата производится в тенге (KZT) через платёжную систему Kaspi Pay. Оплата визового сбора посольству осуществляется отдельно и не включена в стоимость наших услуг, если иное не указано явно.
              </p>
              <p>
                Для начала обработки заявки требуется <strong className="text-foreground">предоплата в размере 100%</strong> стоимости услуг VisaKZ. Визовый сбор посольства оплачивается отдельно на этапе подачи.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">4. Возврат средств</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>Порядок возврата средств зависит от причины:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">Отказ в визе со стороны посольства:</strong> стоимость услуг VisaKZ возвращается в соответствии с условиями заключённого договора. Визовый сбор посольства возврату не подлежит (он удерживается посольством).
                </li>
                <li>
                  <strong className="text-foreground">Отказ клиента от услуг до подачи документов:</strong> возврат составляет <strong className="text-foreground">80%</strong> от уплаченной суммы. 20% удерживается в счёт компенсации уже выполненных работ (консультация, AI-проверка, подготовка анкеты).
                </li>
                <li>
                  <strong className="text-foreground">Отказ клиента после подачи документов:</strong> возврат не производится, так как услуга оказана в полном объёме.
                </li>
                <li>
                  <strong className="text-foreground">Ошибка со стороны VisaKZ:</strong> полный возврат средств в течение 5 рабочих дней.
                </li>
              </ul>
              <p>
                Для оформления возврата обратитесь к нам на{' '}
                <a href="mailto:info@visakz.kz" className="text-primary hover:underline">info@visakz.kz</a>{' '}
                с указанием номера заявки.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">5. Обязанности клиента</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>Клиент обязуется:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>предоставлять <strong className="text-foreground">достоверные и актуальные данные</strong> о себе, целях поездки и финансовом положении;</li>
                <li>загружать <strong className="text-foreground">оригинальные документы</strong> или их качественные сканы без подделок и искажений;</li>
                <li>своевременно отвечать на запросы менеджера и предоставлять дополнительные документы при необходимости;</li>
                <li>не использовать сервис для подачи заведомо ложных сведений или мошеннических действий.</li>
              </ul>
              <p>
                Предоставление ложных сведений является основанием для немедленного расторжения договора без возврата средств и может повлечь юридическую ответственность.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">6. Ограничение ответственности</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                VisaKZ не несёт ответственности за:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">решения посольств и консульств</strong> о выдаче или отказе в визе — эти решения принимаются исключительно иностранными государственными органами;
                </li>
                <li>
                  изменение <strong className="text-foreground">визовых требований</strong> со стороны иностранных государств в ходе обработки заявки;
                </li>
                <li>
                  убытки клиента, возникшие вследствие предоставления <strong className="text-foreground">неполных или недостоверных данных</strong>;
                </li>
                <li>
                  задержки в рассмотрении заявки, вызванные действиями или бездействием посольства.
                </li>
              </ul>
              <p>
                Наша совокупная ответственность перед клиентом не может превышать сумму, фактически уплаченную за услуги VisaKZ по конкретной заявке.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">7. Изменение условий</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                VisaKZ оставляет за собой право вносить изменения в настоящие Условия. О существенных изменениях мы уведомим вас не менее чем за <strong className="text-foreground">30 дней</strong> до вступления их в силу — по электронной почте, указанной при регистрации, или путём размещения уведомления на сайте.
              </p>
              <p>
                Продолжение использования сервиса после вступления изменений в силу означает ваше согласие с новой редакцией Условий.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">8. Применимое право</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                Настоящие Условия регулируются законодательством <strong className="text-foreground">Республики Казахстан</strong>. Все споры, возникающие в связи с использованием сервиса, подлежат рассмотрению в судах города <strong className="text-foreground">Алматы</strong> в соответствии с нормами гражданского процессуального законодательства РК.
              </p>
              <p>
                Стороны обязуются предпринять все разумные усилия для урегулирования споров в досудебном порядке.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">9. Контакты для споров</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                По всем вопросам и претензиям обращайтесь:
              </p>
              <ul className="ml-6 space-y-2 list-none">
                <li>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:info@visakz.kz" className="text-primary hover:underline">info@visakz.kz</a>
                </li>
              </ul>
              <p>
                Претензии рассматриваются в течение 10 рабочих дней с момента получения. При необходимости мы свяжемся с вами для уточнения деталей.
              </p>
            </div>
          </section>

        </div>

        {/* Bottom nav */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            ← Политика конфиденциальности
          </Link>
          <Link href="/" className="text-primary hover:underline">
            На главную →
          </Link>
        </div>
      </div>
    </div>
  )
}
