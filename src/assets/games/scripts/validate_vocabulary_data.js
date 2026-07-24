#!/usr/bin/env node
/**
 * Validates vocabularyData.js exports.
 * Run: node src/assets/games/scripts/validate_vocabulary_data.js
 */

import { vocabularyData } from '../vocabularytrainerData.js';

const FORBIDDEN = /[;:]/;
const LO = 54;
const HI = 72;
const MAX_SPREAD = 12;

const results = [];
let failCount = 0;

function pass(msg) {
  results.push(`PASS: ${msg}`);
}

function fail(msg) {
  results.push(`FAIL: ${msg}`);
  failCount += 1;
}

// 1. non-empty dataset (size evolves as entries are added)
if (vocabularyData.length >= 180) {
  pass(`count >= 180 (${vocabularyData.length})`);
} else {
  fail(`count >= 180 (got ${vocabularyData.length})`);
}

// 2. unique words
const words = vocabularyData.map((e) => e.word);
const uniqueWords = new Set(words);
if (uniqueWords.size === words.length) {
  pass(`unique words (${uniqueWords.size})`);
} else {
  const dupes = words.filter((w, i) => words.indexOf(w) !== i);
  fail(`unique words (duplicates: ${[...new Set(dupes)].join(', ')})`);
}

// 3. no colons/semicolons in definitions
let forbiddenOk = true;
for (const e of vocabularyData) {
  const texts = [e.definition, ...e.distractor_definitions];
  for (const t of texts) {
    if (FORBIDDEN.test(t)) {
      fail(`colons/semicolons in id ${e.id} (${e.word})`);
      forbiddenOk = false;
    }
  }
}
if (forbiddenOk) pass('no colons/semicolons in definitions');

// 4. length spread per entry <= 12
let spreadOk = true;
for (const e of vocabularyData) {
  const lens = [e.definition, ...e.distractor_definitions].map((t) => t.length);
  const spread = Math.max(...lens) - Math.min(...lens);
  if (spread > MAX_SPREAD) {
    fail(`length spread id ${e.id} (${e.word}): ${spread} [${lens.join(', ')}]`);
    spreadOk = false;
  }
  const outOfRange = lens.some((l) => l < LO || l > HI);
  if (outOfRange) {
    fail(`length range id ${e.id} (${e.word}): [${lens.join(', ')}]`);
    spreadOk = false;
  }
}
if (spreadOk) pass(`length spread per entry <= ${MAX_SPREAD} (target ${LO}-${HI} chars)`);

// 5. distractor words: unique, not the answer, not in vocab, not morph variants
function isMorphRelative(word, candidate) {
  const w = word.toLowerCase();
  const c = candidate.toLowerCase();
  if (w === c) return true;
  const pairs = [
    [w, c],
    [c, w],
  ];
  for (const [a, b] of pairs) {
    if (b === `${a}s` || b === `${a}es` || b === `${a}'s`) return true;
    if (a.endsWith('y') && b === `${a.slice(0, -1)}ies`) return true;
    if (b.startsWith(a) && b.length > a.length) {
      const rest = b.slice(a.length);
      if (rest.length <= 4) return true;
      if (
        /^(s|es|ed|ing|er|ers|or|ors|ly|ness|ment|tion|ation|ive|al|ous|ious|able|ible|ity|ize|ise|ary|ory|ial|ism|ist|ists|ance|ence|ant|ent|ure|ship)$/.test(
          rest
        )
      ) {
        return true;
      }
    }
  }
  // long shared prefix + high similarity → same family (galvanize/galvanic)
  let pref = 0;
  for (let i = 0; i < Math.min(w.length, c.length); i += 1) {
    if (w[i] !== c[i]) break;
    pref += 1;
  }
  if (pref >= 6 && Math.abs(w.length - c.length) <= 5) return true;
  return false;
}

let distractorOk = true;
for (const e of vocabularyData) {
  if (e.distractor_words.includes(e.word)) {
    fail(`distractor equals word id ${e.id} (${e.word})`);
    distractorOk = false;
  }
  if (new Set(e.distractor_words).size !== 3) {
    fail(`distractor words not unique id ${e.id} (${e.word})`);
    distractorOk = false;
  }
  if (e.distractor_definitions.length !== 3) {
    fail(`distractor_definitions count id ${e.id} (${e.word})`);
    distractorOk = false;
  }
  if (e.distractor_words.some((w) => uniqueWords.has(w))) {
    fail(`distractor word in vocabulary id ${e.id} (${e.word})`);
    distractorOk = false;
  }
  for (const dw of e.distractor_words) {
    if (isMorphRelative(e.word, dw)) {
      fail(`morphological distractor id ${e.id} (${e.word} ~ ${dw})`);
      distractorOk = false;
    }
  }
}
if (distractorOk) pass('distractor words are genuine confusable options');

// Extra stats
const intermediate = vocabularyData.filter((e) => e.level === 'intermediate').length;
const advanced = vocabularyData.filter((e) => e.level === 'advanced').length;
const pos = vocabularyData.reduce((acc, e) => {
  acc[e.pos] = (acc[e.pos] || 0) + 1;
  return acc;
}, {});
const etymology = vocabularyData.filter((e) => e.etymology).length;

results.push(`INFO: intermediate=${intermediate}, advanced=${advanced}`);
results.push(`INFO: pos=${JSON.stringify(pos)}`);
results.push(`INFO: etymology entries=${etymology}`);

console.log(results.join('\n'));
console.log(`\n${failCount === 0 ? 'All validations passed.' : `${failCount} validation failure(s).`}`);
process.exit(failCount === 0 ? 0 : 1);