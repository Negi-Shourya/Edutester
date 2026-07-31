export interface JEESession {
  year: number;
  sessions: {
    name: string;
    dates: string;
    shifts: number;
  }[];
}

export const jeeSessions: JEESession[] = [
  {
    year: 2020,
    sessions: [
      { name: 'Session 1', dates: 'Jan 6–11', shifts: 2 },
      { name: 'Session 2', dates: 'Apr 5, 7–9, 11', shifts: 2 },
    ],
  },
  {
    year: 2021,
    sessions: [
      { name: 'Session 1', dates: 'Feb 23–26', shifts: 2 },
      { name: 'Session 2', dates: 'Mar 15–18', shifts: 2 },
      { name: 'Session 3', dates: 'Jul 20, 22, 25, 27', shifts: 2 },
      { name: 'Session 4', dates: 'Aug 26–27, 31, Sep 1–2', shifts: 2 },
    ],
  },
  {
    year: 2022,
    sessions: [
      { name: 'Session 1', dates: 'Jun 24–30', shifts: 2 },
      { name: 'Session 2', dates: 'Jul 25–30', shifts: 2 },
    ],
  },
  {
    year: 2023,
    sessions: [
      { name: 'Session 1', dates: 'Jan 24–25, 29–31, Feb 1', shifts: 2 },
      { name: 'Session 2', dates: 'Apr 6, 8, 10–13, 15', shifts: 2 },
    ],
  },
  {
    year: 2024,
    sessions: [
      { name: 'Session 1', dates: 'Jan 27, 29–31, Feb 1', shifts: 2 },
      { name: 'Session 2', dates: 'Apr 4–15', shifts: 2 },
    ],
  },
  {
    year: 2025,
    sessions: [
      { name: 'Session 1', dates: 'Jan 22–24, 28–29', shifts: 2 },
      { name: 'Session 2', dates: 'Apr 2–4, 7–9', shifts: 2 },
    ],
  },
  {
    year: 2026,
    sessions: [
      { name: 'Session 1', dates: 'Jan 21–24, 28–29', shifts: 2 },
      { name: 'Session 2', dates: 'Apr 2–9', shifts: 2 },
    ],
  },
];
