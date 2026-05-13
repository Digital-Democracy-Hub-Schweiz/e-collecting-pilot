import type { TFunction } from 'i18next';

export type LevelKey = 'federal' | 'cantonal' | 'municipal';

const LEGACY_LABEL_TO_KEY: Record<string, LevelKey> = {
  bund: 'federal',
  bundesebene: 'federal',
  kanton: 'cantonal',
  kantonal: 'cantonal',
  gemeinde: 'municipal',
  kommunal: 'municipal',
  confédération: 'federal',
  confederation: 'federal',
  canton: 'cantonal',
  commune: 'municipal',
  confederazione: 'federal',
  cantone: 'cantonal',
  comune: 'municipal',
  confederaziun: 'federal',
  chantun: 'cantonal',
  vischnanca: 'municipal',
  federal: 'federal',
  cantonal: 'cantonal',
  municipal: 'municipal',
};

export const normalizeLevelKey = (value: string | null | undefined): LevelKey | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return LEGACY_LABEL_TO_KEY[normalized] ?? null;
};

export const getLevelLabel = (value: string | null | undefined, t: TFunction): string => {
  const key = normalizeLevelKey(value);
  if (!key) return value ?? '';
  return t(`forms:level.${key}`, { defaultValue: value ?? '' });
};
