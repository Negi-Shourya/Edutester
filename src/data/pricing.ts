import type { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: '1month',
    duration: '1 Month',
    price: 19,
    pricePerMonth: 19,
    features: [
      'Access to all chapter-wise tests',
      'Access to all paper-wise tests',
      'NTA-like test interface',
      'Detailed performance analysis',
      'Chapter-wise progress tracking',
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
      'Priority support',
      'Advanced analytics',
      'Mock test series access',
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
      'All past year papers',
      'Custom test creation',
      'Performance reports PDF',
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
      'Full syllabus coverage',
      'AI-powered recommendations',
      '1-on-1 doubt solving sessions',
      'Access to all future updates',
    ],
  },
];
