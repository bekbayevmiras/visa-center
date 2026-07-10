export const trackEvent = (event: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  // GA4
  if ((window as any).gtag) (window as any).gtag('event', event, params)
  // Meta Pixel
  if ((window as any).fbq) (window as any).fbq('track', event, params)
}

export const trackLead = (country?: string) => trackEvent('Lead', { country })
export const trackApplicationStart = (country: string) => trackEvent('InitiateCheckout', { country })
export const trackApplicationComplete = (value: number, country: string) =>
  trackEvent('Purchase', { value, currency: 'KZT', country })
export const trackWhatsAppClick = () => trackEvent('Contact', { method: 'whatsapp' })
