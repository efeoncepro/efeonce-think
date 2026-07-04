const DEFAULT_COPYRIGHT_OWNER = 'Efeonce Group SpA'

export const getCurrentCopyrightYear = (date: Date = new Date()): number => date.getFullYear()

export const buildCopyrightNotice = (
  owner: string = DEFAULT_COPYRIGHT_OWNER,
  date: Date = new Date(),
): string => `© ${getCurrentCopyrightYear(date)} ${owner}.`
