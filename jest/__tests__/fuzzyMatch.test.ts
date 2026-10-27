import { fuzzyMatch } from "@/_utils/helpers";

describe('fuzzyMatch', () => {
  it('matches exact substring', () => expect(fuzzyMatch('north', 'Northern Star')).toBe(true));
  it('matches characters in sequence', () => expect(fuzzyMatch('nrth', 'Northern Star')).toBe(true));
  it('is case insensitive', () => expect(fuzzyMatch('NORTH', 'northern star')).toBe(true));
  it('returns false when no match', () => expect(fuzzyMatch('zzz', 'Northern Star')).toBe(false));
});
