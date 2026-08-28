import type { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: '1month',
    duration: '1 Month',
    price: 19,
    pricePerMonth: 19,
    months: 1,
    features: [
      'Authentic NTA-like test interface',
      'All 54 Chapter-wise tests (Physics, Chem, Math, Bio)',
      'Previous year question papers (JEE & NEET)',
      'Instant scoring & detailed step-by-step solutions',
      'Dashboard analytics & weakness tracker',
    ],
  },
  {
    id: '3months',
    duration: '3 Months',
    price: 50,
    pricePerMonth: 16.67,
    months: 3,
    popular: true,
    features: [
      'Everything in 1 Month plan',
      'Unlimited attempts on all 54 chapter tests',
      'Full-length papers & test series access',
      'Save ₹7 compared to monthly',
    ],
  },
  {
    id: '6months',
    duration: '6 Months',
    price: 94,
    pricePerMonth: 15.67,
    months: 6,
    features: [
      'Everything in 3 Months plan',
      'Complete JEE & NEET chapter question banks',
      'Priority solution updates & test releases',
      'Save ₹56 compared to monthly',
    ],
  },
  {
    id: '1year',
    duration: '1 Year',
    price: 159,
    pricePerMonth: 13.25,
    months: 12,
    features: [
      'Everything in 6 Months plan',
      'Full yearly access to all papers & chapters',
      'Maximum savings (₹69 off monthly)',
    ],
  },
];
