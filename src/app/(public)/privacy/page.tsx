import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — VisaKZ',
  description: 'Политика конфиденциальности VisaKZ — как мы собираем, используем и защищаем ваши персональные данные.',
}

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Правовые документы
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-foreground">
            Политика конфиденциальности
          </h1>
          <p className="text-muted-foreground">
            Дата последнего обновления: <time dateTime="2026-07-10">10 июля 2026 г.</time>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-foreground">

          {/* 1 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">1. Введение</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                VisaKZ (далее — «мы», «нас», «наш сервис») — визовый центр с AI-поддержкой, зарегистрированный в Республике Казахстан. Мы оказываем услуги по подготовке и оформлению документов для получения виз в различные страны мира.
              </p>
              <p>
                Настоящая Политика конфиденциальности описывает, какие персональные данные мы собираем, каким образом используем, храним и защищаем их, а также какие права у вас есть в отношении ваших данных.
              </p>
              <p>
                Используя наш сайт и сервисы, вы соглашаетесь с условиями данной Политики. Если вы не согласны с её положениями, пожалуйста, воздержитесь от использования наших услуг.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">2. Какие данные мы собираем</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>Мы собираем следующие категории персональных данных:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">Идентификационные данные:</strong> имя и фамилия, дата рождения, гражданство.
                </li>
                <li>
                  <strong className="text-foreground">Контактные данные:</strong> адрес электронной почты (email), номер телефона (в том числе для связи через WhatsApp).
                </li>
                <li>
                  <strong className="text-foreground">Паспортные данные:</strong> серия и номер паспорта, дата выдачи и срок действия, орган, выдавший документ.
                </li>
                <li>
                  <strong className="text-foreground">Загружаемые документы:</strong> сканы и фотографии паспорта, справок, финансовых документов и иных материалов, необходимых для оформления визы.
                </li>
                <li>
                  <strong className="text-foreground">Технические данные:</strong> IP-адрес, тип браузера и устройства, данные файлов cookie, страницы, которые вы посещаете, и время пребывания на сайте.
                </li>
              </ul>
              <p>
                Мы собираем только те данные, которые необходимы для оказания визовых услуг и обеспечения корректной работы сервиса.
              </p>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">3. Как мы используем данные</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>Ваши персональные данные используются в следующих целях:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">Обработка заявок на визу:</strong> подготовка, проверка и подача документов в посольства и консульства.
                </li>
                <li>
                  <strong className="text-foreground">Связь с клиентами:</strong> уведомления о статусе заявки, запросы дополнительных документов, ответы на вопросы.
                </li>
                <li>
                  <strong className="text-foreground">Улучшение сервиса:</strong> анализ использования сайта, выявление ошибок, совершенствование интерфейса.
                </li>
                <li>
                  <strong className="text-foreground">AI-анализ документов:</strong> автоматическая проверка загруженных документов с помощью искусственного интеллекта на полноту и соответствие требованиям консульства.
                </li>
                <li>
                  <strong className="text-foreground">Финансовые операции:</strong> выставление счетов, обработка платежей и возвратов.
                </li>
              </ul>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">4. Хранение данных</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                Ваши данные хранятся на платформе <strong className="text-foreground">Supabase</strong>, серверы которой расположены в Европейском союзе (регион EU West). Передача данных осуществляется по защищённому протоколу HTTPS, данные на серверах зашифрованы (AES-256).
              </p>
              <p>
                Мы храним ваши персональные данные в течение <strong className="text-foreground">3 лет</strong> после даты вашей последней активности в системе. По истечении этого срока данные автоматически удаляются, если иное не предусмотрено требованиями законодательства.
              </p>
              <p>
                Загруженные документы удаляются из системы после завершения обработки заявки и истечения срока хранения, если вы не обратитесь к нам с запросом об удалении ранее.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">5. Передача данных третьим лицам</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>Мы передаём ваши данные третьим лицам только в следующих случаях:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">Посольства и консульства:</strong> передача документов и персональных данных является обязательным условием оформления визы. Без этой передачи оказание услуги невозможно.
                </li>
                <li>
                  <strong className="text-foreground">Платёжные системы:</strong> для обработки оплаты используется сервис <strong className="text-foreground">Kaspi Pay</strong>. Платёжные данные передаются напрямую платёжному провайдеру и не хранятся на наших серверах.
                </li>
                <li>
                  <strong className="text-foreground">Требования законодательства:</strong> мы можем раскрыть данные по запросу уполномоченных государственных органов в соответствии с законодательством Республики Казахстан.
                </li>
              </ul>
              <p>
                Мы <strong className="text-foreground">никогда не продаём</strong> и не передаём ваши персональные данные третьим лицам в маркетинговых или коммерческих целях без вашего явного согласия.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">6. Ваши права</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>В соответствии с законодательством о персональных данных вы имеете следующие права:</p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">Право на доступ:</strong> вы можете запросить информацию о том, какие ваши данные мы обрабатываем.
                </li>
                <li>
                  <strong className="text-foreground">Право на исправление:</strong> вы можете потребовать исправить неточные или устаревшие данные.
                </li>
                <li>
                  <strong className="text-foreground">Право на удаление:</strong> вы можете запросить удаление ваших персональных данных, если они больше не нужны для оказания услуги.
                </li>
                <li>
                  <strong className="text-foreground">Право на отзыв согласия:</strong> вы можете в любой момент отозвать согласие на обработку данных, направив нам запрос.
                </li>
              </ul>
              <p>
                Для реализации ваших прав обратитесь к нам по адресу{' '}
                <a href="mailto:info@visakz.kz" className="text-primary hover:underline">info@visakz.kz</a>.
                Мы рассмотрим ваш запрос в течение 10 рабочих дней.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">7. Cookies</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>
                Наш сайт использует файлы cookie — небольшие текстовые файлы, сохраняемые в вашем браузере. Мы применяем следующие типы cookie:
              </p>
              <ul className="ml-6 space-y-2 list-disc">
                <li>
                  <strong className="text-foreground">Обязательные cookie:</strong> необходимы для работы сайта и аутентификации пользователей. Без них сайт не может функционировать корректно.
                </li>
                <li>
                  <strong className="text-foreground">Аналитические cookie:</strong> помогают нам понять, как посетители взаимодействуют с сайтом, чтобы улучшить его работу.
                </li>
                <li>
                  <strong className="text-foreground">Функциональные cookie:</strong> запоминают ваши предпочтения (например, язык) для более удобного использования сайта.
                </li>
              </ul>
              <p>
                Вы можете отключить cookie в настройках браузера, однако это может повлиять на работу отдельных функций сайта.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">8. Контакты</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>По всем вопросам, связанным с обработкой персональных данных, обращайтесь к нам:</p>
              <ul className="ml-6 space-y-2 list-none">
                <li>
                  <strong className="text-foreground">Email:</strong>{' '}
                  <a href="mailto:info@visakz.kz" className="text-primary hover:underline">info@visakz.kz</a>
                </li>
                <li>
                  <strong className="text-foreground">Телефон:</strong>{' '}
                  <a href="tel:+77271234567" className="text-primary hover:underline">+7 (727) 123-45-67</a>
                </li>
                <li>
                  <strong className="text-foreground">Адрес:</strong> г. Алматы, Республика Казахстан
                </li>
              </ul>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">9. Дата последнего обновления</h2>
            <p className="leading-relaxed text-muted-foreground">
              Настоящая Политика конфиденциальности последний раз обновлялась{' '}
              <time dateTime="2026-07-10"><strong className="text-foreground">10 июля 2026 г.</strong></time>{' '}
              Мы оставляем за собой право вносить изменения в данный документ. При существенных изменениях мы уведомим вас по электронной почте или путём размещения уведомления на сайте.
            </p>
          </section>

        </div>

        {/* Bottom nav */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← На главную
          </Link>
          <Link href="/terms" className="text-primary hover:underline">
            Условия использования →
          </Link>
        </div>
      </div>
    </div>
  )
}
