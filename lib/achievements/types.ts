/**
 * Types for achievements data structure
 */

export type AchievementLevel = 'Oddział' | 'Okręg' | 'Region V' | 'MP';

export interface CategoryResult {
  category: string;
  title: string;
  coefficient: number | null;
  concourses: number | null;
  note?: string;
}

export interface DivisionResults {
  level: AchievementLevel;
  divisionName: string;
  results: CategoryResult[];
}

export interface YearData {
  year: number;
  divisions: DivisionResults[];
  masteryScore: number;
  totalMasterTitles: number;
}

