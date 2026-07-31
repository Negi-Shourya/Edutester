import type { Question } from '../types';
import { apr02MorningQuestions } from './papers/apr02Morning';
import { apr02EveningQuestions } from './papers/apr02Evening';
import { apr04MorningQuestions } from './papers/apr04Morning';
import { apr04EveningQuestions } from './papers/apr04Evening';
import { apr05MorningQuestions } from './papers/apr05Morning';
import { apr05EveningQuestions } from './papers/apr05Evening';
import { apr06MorningQuestions } from './papers/apr06Morning';
import { apr06EveningQuestions } from './papers/apr06Evening';
import { apr08EveningQuestions } from './papers/apr08Evening';

export {
  apr02MorningQuestions,
  apr02EveningQuestions,
  apr04MorningQuestions,
  apr04EveningQuestions,
  apr05MorningQuestions,
  apr05EveningQuestions,
  apr06MorningQuestions,
  apr06EveningQuestions,
  apr08EveningQuestions,
};

export function getPaperQuestions(paperKey?: string): Question[] {
  if (paperKey === '02-apr-evening') {
    return apr02EveningQuestions;
  }
  if (paperKey === '04-apr-morning') {
    return apr04MorningQuestions;
  }
  if (paperKey === '04-apr-evening') {
    return apr04EveningQuestions;
  }
  if (paperKey === '05-apr-morning') {
    return apr05MorningQuestions;
  }
  if (paperKey === '05-apr-evening') {
    return apr05EveningQuestions;
  }
  if (paperKey === '06-apr-morning') {
    return apr06MorningQuestions;
  }
  if (paperKey === '06-apr-evening') {
    return apr06EveningQuestions;
  }
  if (paperKey === '08-apr-evening') {
    return apr08EveningQuestions;
  }
  return apr02MorningQuestions;
}

export const mockQuestions: Question[] = apr02MorningQuestions;
