import data from './data/specimens.json'

/**
 * The tour's visitor has no account and no gender. The platform's `useG()`
 * defaults an unknown student to FEMININE; the public site speaks
 * masculine-generic («ابدأ»، «جرّب»). So every g(male, female) call in the
 * ported sheets resolves to the first form, and strings the platform hardcodes
 * in the feminine are rewritten by hand where they are used.
 */
export const g = (male) => male

export const ITEMS = data.items
export const LIBRARY = data.library
export const PROVERBS = ITEMS.filter((x) => x.kind === 'proverb')
export const IDIOMS = ITEMS.filter((x) => x.kind === 'idiom')

export const ROOM_PATH = '/tour/expressions'
export const sheetPath = (it) => `${ROOM_PATH}/${it.kind}/${it.slug}`
