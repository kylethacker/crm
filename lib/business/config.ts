export interface Service {
  name: string;
  duration: number; // minutes
  price: number;
}

export interface BusinessConfig {
  businessName: string;
  timezone: string;
  businessHours: {
    days: string[];
    open: string; // HH:mm
    close: string; // HH:mm
  };
  services: Service[];
  reviewLinks: {
    google: string;
    yelp?: string;
  };
}

export const businessConfig: BusinessConfig = {
  businessName: 'Acme CRM Solutions',
  timezone: 'America/New_York',
  businessHours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    open: '08:00',
    close: '17:00',
  },
  services: [
    { name: 'Discovery Call', duration: 30, price: 0 },
    { name: 'Product Demo', duration: 45, price: 0 },
    { name: 'Implementation Kickoff', duration: 90, price: 2500 },
    { name: 'Quarterly Business Review', duration: 60, price: 0 },
    { name: 'Custom Integration Setup', duration: 120, price: 4500 },
  ],
  reviewLinks: {
    google: 'https://g.page/r/acme-crm-solutions/review',
    yelp: 'https://www.yelp.com/biz/acme-crm-solutions',
  },
};
