# Context

## Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide icons
- **Routing**: React Router v7

## Project Structure
```
src/
├── components/   # Reusable UI (Navbar, Footer, PricingCard, etc.)
├── pages/        # Route-level components
├── data/         # Mock data (pricing, chapters, papers)
├── types/        # TypeScript interfaces
├── App.tsx       # Route definitions
└── main.tsx      # Entry point with BrowserRouter
```

## Pricing
| Plan | Price | ₹/mo |
|------|-------|------|
| 1M   | ₹19  | 19   |
| 3M   | ₹50  | 16.7 |
| 6M   | ₹94  | 15.7 |
| 1Y   | ₹159 | 13.3 |

## NTA Interface
- Question palette: green (answered), red (not answered), purple (marked), gray (not visited)
- Controls: Save & Next, Mark for Review & Next, Clear Response
- 3-hour countdown timer with low-time warning
- 3 sections: Physics, Chemistry, Mathematics

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
