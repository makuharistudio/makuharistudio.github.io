#!/usr/bin/env node
/**
 * Validates vocabularyData.js exports.
 * Run: node src/games/scripts/validate_vocabulary_data.js
 */

import { vocabularyData } from '../../assets/games/vocabularytrainerData.js';

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

// 1. count === 180
if (vocabularyData.length === 180) {
  pass(`count === 180 (${vocabularyData.length})`);
} else {
  fail(`count === 180 (got ${vocabularyData.length})`);
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

// 5. no distractor word equals correct word
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
}
if (distractorOk) pass('no distractor word equals correct word');

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