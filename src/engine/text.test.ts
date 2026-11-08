import { describe, expect, it } from 'vitest';
import { interpretText } from './text';

const read = (s: string, isFill = false) =>
  interpretText('q', s, { isFill }).map((f) => `${f.team ?? f.gift}:${f.interpretation}`);

describe('text interpretation', () => {
  it('distinguishes the four "teaching children" statements', () => {
    expect(read('I love teaching children.')).toContain('kids:current');
    expect(read('I used to teach children, but I do not want to right now.')).toContain('kids:opt_out');
    expect(read('I have never taught children, but I want to learn.')).toContain('kids:growth');
    expect(read('I like teaching adults, not working with kids.')).toContain('kids:opt_out');
    expect(read('I like teaching adults, not working with kids.')).toContain('teaching:current');
  });

  it('handles negation, growth, history, third person, and uncertainty', () => {
    expect(read('I do not enjoy troubleshooting.')).toEqual(['tech:negated']);
    expect(read('I have no audio experience, but I would love to learn.')).toEqual(['tech:growth']);
    expect(read('I used to lead worship, but I want to explore something different.')).toEqual(['worship:moving_on']);
    expect(read('My spouse loves working with children.')).toEqual(['kids:third_party']);
    expect(read('Maybe help with sound?')).toEqual(['tech:uncertain']);
  });

  it('does not infer gifts from ambiguous single words', () => {
    expect(read('I like to give and listen and lead.')).toEqual([]);
  });

  it('treats fill-in-the-blank text as first person', () => {
    expect(read('fix things', true)).toEqual(['tech:current']);
  });

  it('records rule provenance and version', () => {
    const [f] = interpretText('c4_story', 'I love singing.');
    expect(f).toMatchObject({ questionId: 'c4_story', phrase: 'singing', ruleId: 'worship.vocal', ruleVersion: expect.stringMatching(/^sig-/) });
  });
});
