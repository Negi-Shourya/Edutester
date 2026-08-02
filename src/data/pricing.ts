import type { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: '1month',
    duration: '1 Month',
    price: 19,
    pricePerMonth: 19,
    features: [
      'Authentic NTA-like test interface',
      'Previous year question papers',
      'Full-length test series',
      'Support for questions & issues',
    ],
  },
  {
    id: '3months',
    duration: '3 Months',
    price: 50,
    pricePerMonth: 16.67,
    popular: true,
    features: [
      'Everything in 1 Month plan',
      'Save ₹7 compared to monthly',
    ],
  },
  {
    id: '6months',
    duration: '6 Months',
    price: 94,
    pricePerMonth: 15.67,
    features: [
      'Everything in 3 Months plan',
      'Save ₹56 compared to monthly',
    ],
  },
  {
    id: '1year',
    duration: '1 Year',
    price: 159,
    pricePerMonth: 13.25,
    features: [
      'Everything in 6 Months plan',
      'Save ₹69 compared to monthly',
    ],
  },
];
