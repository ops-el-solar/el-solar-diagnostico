/**
 * Analytics Events — El Solar Diagnostico
 * Integración con GA4 y Meta Pixel
 */

export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', eventName, eventData || {});
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && 'fbq' in window) {
    (window as any).fbq('track', eventName, eventData || {});
  }
};

/**
 * Eventos de conversión predefinidos
 */
export const events = {
  // Lead Magnet
  lead_magnet_view: () => trackEvent('view_content', {
    content_type: 'lead_magnet',
    content_name: 'Diagnostico B2B'
  }),
  
  form_start: () => trackEvent('form_start', {
    form_name: 'diagnostico_form'
  }),
  
  form_submit: (formData?: Record<string, any>) => {
    trackEvent('form_submit', {
      form_name: 'diagnostico_form',
      ...formData
    });
    trackEvent('Lead', {
      value: 1,
      currency: 'COP'
    });
  },
  
  report_generated: (reportData?: Record<string, any>) => {
    trackEvent('report_generated', {
      report_type: 'diagnostico_b2b',
      ...reportData
    });
    trackEvent('Purchase', {
      value: 1,
      currency: 'COP',
      content_type: 'report'
    });
  },
  
  email_sent: () => trackEvent('email_sent', {
    email_type: 'diagnostico_report'
  }),
  
  page_view: (pageName: string) => trackEvent('page_view', {
    page_title: pageName
  }),
  
  error: (errorData?: Record<string, any>) => trackEvent('error', {
    error_source: 'diagnostico',
    ...errorData
  })
};
