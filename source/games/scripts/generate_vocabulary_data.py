#!/usr/bin/env python3
"""Generate vocabularytrainerData.js with validated vocabulary entries."""

import re
import sys
from pathlib import Path

from collections import Counter

from vocab_extra_data import INTERMEDIATE_NEW, ADVANCED_NEW
from vocab_explanations import EXPLANATIONS
from vocab_explanations_vn import EXPLANATIONS_VN
from vocab_distractors import assign_distractors, assert_distractors_ok, is_morph_relative

EXPLANATIONS = {**EXPLANATIONS, **EXPLANATIONS_VN}

OUTPUT = Path(__file__).resolve().parents[1] / "vocabularytrainerData.js"
FORBIDDEN = re.compile(r"[;:]")
# Short natural extensions for length balancing (no colons/semicolons)
EXPAND_CLAUSES = [
    " in most cases",
    " for most readers",
    " in daily practice",
    " on close review",
    " in ordinary life",
    " among observers",
    " without extra context",
    " in plain terms",
]
BAD_ENDINGS = (
    " to", " and", " or", " the", " a", " an", " in", " of", " for",
    " with", " than", " as", " by", " on", " at", " if", " but",
)

RAW = []


def entry(*args):
    RAW.append(args)


def normalize_meanings(meanings, lo=54, hi=72, max_spread=12):
    texts = [FORBIDDEN.sub(" and", m.strip()) for m in meanings]
    if any(FORBIDDEN.search(t) for t in texts):
        raise ValueError(f"Forbidden char in: {texts}")

    def lens(ts):
        return [len(t) for t in ts]

    def valid(ts):
        ls = lens(ts)
        return max(ls) - min(ls) <= max_spread and all(lo <= l <= hi for l in ls)

    def ends_cleanly(text):
        core = text[:-1] if text.endswith(".") else text
        return not core.endswith(BAD_ENDINGS)

    def trim_to(t, max_len):
        if len(t) <= max_len:
            return t
        core = t[:-1] if t.endswith(".") else t
        candidates = []
        if " and " in core:
            parts = core.split(" and ")
            for i in range(len(parts) - 1, 0, -1):
                candidates.append(" and ".join(parts[:i]) + ".")
        if ", " in core:
            parts = core.split(", ")
            for i in range(len(parts) - 1, 0, -1):
                candidates.append(", ".join(parts[:i]) + ".")
        words = core.split()
        for drop in range(1, min(4, len(words) - 4)):
            candidates.append(" ".join(words[:-drop]) + ".")
        viable = [
            c for c in candidates
            if len(c) <= max_len and ends_cleanly(c) and len(c) >= lo
        ]
        if viable:
            return max(viable, key=len)
        return t

    def expand_to(t, min_len, clause_offset=0):
        if len(t) >= min_len:
            return t
        base = t[:-1] if t.endswith(".") else t
        for step in range(len(EXPAND_CLAUSES) * 2):
            clause = EXPAND_CLAUSES[(clause_offset + step) % len(EXPAND_CLAUSES)]
            candidate = base + clause + "."
            if len(candidate) <= hi:
                t = candidate
                if len(t) >= min_len:
                    return t
                base = t[:-1]
        return t

    adjusted = [t if t.endswith(".") else t + "." for t in texts]

    for _ in range(40):
        if valid(adjusted):
            return adjusted
        ls = lens(adjusted)
        target = max(lo, min(hi, round(sum(ls) / len(ls))))
        floor = max(lo, target - max_spread // 2)
        ceiling = min(hi, floor + max_spread)
        if ceiling - floor < max_spread:
            floor = max(lo, ceiling - max_spread)
        adjusted = [
            expand_to(trim_to(t, ceiling), floor, clause_offset=i)
            if len(t) < floor
            else trim_to(t, ceiling)
            for i, t in enumerate(adjusted)
        ]

    for _ in range(60):
        if valid(adjusted):
            return adjusted
        ls = lens(adjusted)
        shortest = min(ls)
        longest = max(ls)
        floor = max(lo, longest - max_spread)
        ceiling = min(hi, shortest + max_spread)
        if ceiling < floor:
            mid = (shortest + longest) // 2
            floor = max(lo, mid - max_spread // 2)
            ceiling = min(hi, floor + max_spread)
        for i, t in enumerate(adjusted):
            if len(t) < floor:
                adjusted[i] = expand_to(t, floor, clause_offset=i)
            elif len(t) > ceiling:
                adjusted[i] = trim_to(t, ceiling)

    return adjusted


# ═══════════════════════════════════════════════════════════════════════════════
# ORIGINAL 60
# ═══════════════════════════════════════════════════════════════════════════════
entry("inchoate","adjective","intermediate","Just begun and still undeveloped and lacking clear form or structure.","Fully formed and carefully structured from the very outset in design.","Deliberately hidden or kept secret from other people in the group.","Showing excessive pride in one's own personal achievements at work.","incipient","innocuous","inchoative",'From Latin inchoare, "to begin."')
entry("pervious","adjective","intermediate","Allowing passage or penetration and permeable to water or light.","Completely sealed and resistant to any outside influence or pressure.","Easily offended or quick to take personal insult or offence in public.","Showing careful attention to detail and cleanliness in daily habits.","impervious","pernicious","perfidious")
entry("evanescent","adjective","intermediate","Vanishing or fading quickly and lasting only a very short time.","Permanently fixed and impossible to erase or remove.","Growing stronger and more intense over long periods.","Clearly visible from a great distance in daylight.","effervescent","equanimous","evasive")
entry("fastidious","adjective","intermediate","Very attentive to accuracy and detail and hard to please others.","Careless about standards and easily satisfied with poor work.","Quick to anger and prone to sudden emotional outbursts.","Generous with money and eager to share personal wealth.","facetious","fatuous","fallacious")
entry("incipient","adjective","intermediate","In an early stage and just beginning to appear or develop.","Fully mature and at the peak of full development.","Deliberately delayed or postponed for an indefinite time.","Repeated so often that it has become quite tiresome.","inchoate","insipid","insidious")
entry("gregarious","adjective","intermediate","Fond of company and sociable and enjoying being with other people.","Preferring solitude and avoiding most social gatherings when possible.","Aggressively hostile toward unfamiliar people in public settings.","Indifferent to the feelings and needs of other people nearby.","egregious","grandiose","granular")
entry("laconic","adjective","intermediate","Using very few words and concise to the point of seeming terse.","Excessively talkative and prone to long rambling speeches.","Deliberately vague and difficult for readers to interpret.","Emotionally expressive and openly sentimental in speech.","verbose","loquacious","languid")
entry("taciturn","adjective","intermediate","Reserved or uncommunicative and saying little by long habit.","Warmly expressive and eager to share personal stories.","Easily persuaded and quick to change one's own mind.","Playfully humorous even in very serious situations.","garrulous","turbulent","tacit")
entry("capricious","adjective","intermediate","Given to sudden unpredictable changes of mood or behaviour.","Steady and reliable under nearly all circumstances.","Deeply thoughtful before making any important decision.","Strictly bound by formal rules and long tradition.","capacious","captious","corpulent")
entry("munificent","adjective","intermediate","Extremely generous, especially with money or valuable gifts.","Reluctant to spend even on basic daily necessities.","Secretive about one's own financial affairs.","Indifferent to charitable causes and public need.","magnanimous","maleficent","mendacious")
entry("parsimonious","adjective","intermediate","Unwilling to spend money or use resources and frugal to excess.","Extravagant and careless with personal wealth and income.","Openly boastful about large charitable donations.","Indifferent to the cost of luxury goods and services.","perspicacious","pernicious","profligate")
entry("sanguine","adjective","intermediate","Optimistic or confident, especially in a difficult situation.","Deeply pessimistic and expecting the worst possible outcome.","Physically pale and lacking healthy colour in the face.","Emotionally detached and indifferent to most outcomes.","saturnine","sanguinary","sanctimonious")
entry("amenable","adjective","intermediate","Willing to be persuaded or accept a suggestion and cooperative.","Stubbornly resistant to any form of advice or counsel.","Legally exempt from standard regulations and duties.","Physically unable to perform required tasks or duties.","inimical","immutable","imperious")
entry("pragmatic","adjective","intermediate","Dealing with things sensibly and practically rather than in theory.","Guided purely by abstract ideals regardless of practical results.","Deeply suspicious of any practical compromise with opponents.","Focused exclusively on historical precedent instead of outcomes.","dogmatic","dramatic","diplomatic")
entry("verbose","adjective","intermediate","Using more words than needed and wordy and long-winded.","Remarkably brief and economical with language and tone.","Deliberately cryptic and hard for others to understand.","Silent in writing as well as in ordinary speech.","laconic","venerable","veracious")
entry("obstinate","adjective","intermediate","Stubbornly refusing to change one's opinion or course of action.","Easily swayed by the latest argument heard in debate.","Physically flexible and quick to adapt bodily posture.","Eager to abandon plans at the first sign of trouble.","obsequious","obtuse","opulent")
entry("ephemeral","adjective","intermediate","Lasting for a very short time and transitory in nature.","Enduring unchanged across many centuries of history.","Gradually strengthening year after year without fail.","Fixed permanently in law and custom for all time.","eternal","empirical","effulgent")
entry("ubiquitous","adjective","intermediate","Present, appearing, or found everywhere at the same time.","Extremely rare and seldom encountered anywhere on earth.","Confined to a single remote geographic region only.","Visible only under specific laboratory test conditions.","unilateral","univocal","utilitarian",'From Latin ubique, meaning "everywhere."')
entry("benevolent","adjective","intermediate","Well-meaning and kindly and desiring to do good for others.","Motivated chiefly by personal gain and bitter rivalry.","Indifferent to the suffering of strangers and outsiders.","Deliberately cruel in both speech and daily action.","malevolent","belligerent","benighted")
entry("garrulous","adjective","intermediate","Excessively talkative, especially about trivial everyday matters.","Preferring silence even in lively social company.","Speaking only when formally invited to do so.","Choosing words with extreme precision and brevity.","laconic","taciturn","grandiloquent")
entry("prolix","adjective","intermediate","Using too many words and tediously lengthy in speech or writing.","Notably concise and free of unnecessary extra detail.","Written in a style that invites multiple interpretations.","Composed entirely of short disconnected phrases only.","laconic","pellucid","precocious")
entry("esoteric","adjective","intermediate","Intended for or understood by only a small specialised group.","Designed for universal comprehension by any casual reader.","Deliberately simplified for beginner audiences and children.","Widely discussed in everyday conversation and media.","exoteric","empirical","erudite")
entry("mendacious","adjective","intermediate","Not telling the truth and lying or habitually dishonest.","Scrupulously honest even at considerable personal cost.","Silent rather than deceptive when pressed for answers.","Careful to verify facts carefully before speaking.","veracious","munificent","magnanimous")
entry("circumspect","adjective","intermediate","Wary and unwilling to take risks and cautious and prudent.","Reckless and indifferent to foreseeable danger ahead.","Openly boastful about risky personal achievements.","Impulsive in both speech and action without pause.","incautious","impetuous","imprudent")
entry("quixotic","adjective","advanced","Highly idealistic and impractical while pursuing noble but unrealistic goals.","Coldly calculating and focused solely on profit margins in business.","Strictly conventional and resistant to any imagination in planning.","Deliberately cynical about all moral ideals and hope in practice.","pragmatic","quiescent","querulous",'From Don Quixote, the idealistic knight of Cervantes\' novel.')
entry("meretricious","adjective","advanced","Attractive on the surface but lacking real value and showily flashy style.","Genuinely profound and backed by solid careful evidence in research.","Understated in style and free of ornament or display in design.","Earned through long disciplined study and hard work over years.","meritorious","munificent","meticulous")
entry("recondite","adjective","advanced","Little known and abstruse and understood by few specialists.","Common knowledge taught in primary school classrooms.","Deliberately simplified for mass audiences and readers.","Frequently cited in casual everyday conversation.","abstruse","redundant","recalcitrant")
entry("abstruse","adjective","advanced","Difficult to understand and obscure and complex in structure.","Immediately clear to any attentive casual reader.","Written in plain language for general everyday use.","Self-evident without need for further explanation.","obtuse","abject","abscond")
entry("perspicacious","adjective","advanced","Having keen mental perception and insight and shrewdly discerning.","Slow to grasp even obvious connections in data.","Easily misled by superficial appearances and style.","Indifferent to subtle patterns in evidence and facts.","perspicuous","pernicious","pusillanimous")
entry("lugubrious","adjective","advanced","Looking or sounding mournful and dismal and gloomily exaggerated.","Cheerful and light-hearted in nearly every setting.","Calmly neutral without emotional colour or tone.","Playfully ironic rather than sorrowful in manner.","luminous","ludicrous","languid")
entry("petulant","adjective","advanced","Childishly sulky or bad-tempered over minor everyday frustrations.","Remarkably patient when facing repeated delays.","Warmly gracious under intense public criticism.","Stoically indifferent to personal inconvenience.","placid","phlegmatic","pertinacious")
entry("obstreperous","adjective","advanced","Noisy and difficult to control and aggressively defiant.","Quietly compliant in group settings and meetings.","Eager to follow instructions without protest or delay.","Reserved and reluctant to voice any disagreement.","obsequious","ostensible","ossified")
entry("supercilious","adjective","advanced","Behaving as though one is superior to others and haughtily disdainful.","Humble and eager to learn from anyone at all.","Warmly respectful toward all social ranks and classes.","Self-deprecating even when highly skilled and praised.","superficial","supine","sublime")
entry("pusillanimous","adjective","advanced","Showing a lack of courage or determination and timid and faint-hearted.","Boldly facing danger without hesitation or delay.","Renowned for decisive leadership during crisis.","Willing to sacrifice comfort for principle and duty.","pugnacious","perspicacious","portentous")
entry("magnanimous","adjective","advanced","Generous in forgiving insult or injury and noble in overlooking wrongs.","Vindictive and eager to settle old personal scores.","Petty in disputes over minor slights and insults.","Indifferent to the welfare of former rivals and foes.","malevolent","meretricious","mendacious")
entry("intransigent","adjective","advanced","Unwilling to change one's views or agree to any compromise.","Flexible and quick to revise positions when needed.","Eager to mediate between opposing sides in conflict.","Guided chiefly by consensus rather than conviction.","intrepid","insouciant","inchoate")
entry("recalcitrant","adjective","advanced","Resisting authority or control and stubbornly uncooperative.","Dutifully obedient to legitimate instruction and orders.","Eager to volunteer for assigned tasks without delay.","Deferential toward established hierarchy and rank.","recondite","recumbent","redoubtable")
entry("erudite","adjective","advanced","Having or showing great knowledge acquired by study and scholarly.","Lacking formal education and widely uninformed.","Skilled only in practical trades and not books.","Indifferent to reading and intellectual debate.","erratic","eremitic","ethereal")
entry("ineffable","adjective","advanced","Too great or extreme to be expressed in ordinary words.","Easily described with a single plain clear sentence.","Routinely summarised in everyday casual speech.","Fully captured by a short textbook definition.","infallible","indelible","indefatigable")
entry("insouciant","adjective","advanced","Showing a casual lack of concern and nonchalantly unconcerned.","Perpetually anxious about every small detail.","Deeply invested in others' opinions and approval.","Formally solemn in all social encounters and meetings.","insidious","insipid","inscrutable")
entry("querulous","adjective","advanced","Complaining in a petulant or whining manner about things.","Contented and rarely voicing dissatisfaction aloud.","Grateful even when circumstances are quite difficult.","Silent about discomfort rather than protesting openly.","quiescent","quixotic","quotidian")
entry("truculent","adjective","advanced","Eager to argue or fight and aggressively defiant and hostile.","Gentle and reluctant to enter any dispute at all.","Diplomatic when facing sharp disagreement and conflict.","Submissive in order to avoid confrontation entirely.","turbulent","trenchant","tranquil")
entry("jejune","adjective","advanced","Naive, simplistic, and uninteresting and lacking nourishing substance.","Richly complex and intellectually demanding for readers.","Mature in judgment and worldly experience and depth.","Engaging even to expert audiences and specialists.","jocund","jubilant","judicious")
entry("scintillating","adjective","advanced","Brilliantly lively, stimulating, and witty in conversation.","Dull and unlikely to hold an audience's attention.","Monotonous in tone and predictable in content.","Heavy with jargon and devoid of humour or charm.","sedentary","sequestered","soporific")
entry("obsequious","adjective","advanced","Obedient or attentive to an excessive or servile degree.","Fiercely independent and blunt with all superiors.","Reserved and respectful without flattery or praise.","Willing to challenge authority when it clearly errs.","obstreperous","officious","ominous")
entry("perfunctory","adjective","advanced","Carried out with minimal effort or reflection and superficially done.","Executed with meticulous care and deep sustained focus.","Guided by genuine curiosity and thoroughness always.","Repeated until mastery is clearly demonstrated by all.","perfidious","perspicacious","pertinacious")
entry("assiduous","adjective","advanced","Showing great care, attention, and persistent sustained effort.","Careless and easily distracted from assigned tasks.","Working only in brief irregular bursts of energy.","Abandoning projects at the first sign of difficulty.","audacious","asinine","astute")
entry("voracious","adjective","advanced","Wanting or devouring great quantities and insatiably eager.","Satisfied with small portions of anything offered.","Indifferent to new information or fresh experience.","Reluctant to engage with unfamiliar material.","veracious","venerable","vicarious")
entry("reticent","adjective","advanced","Not revealing one's thoughts or feelings readily and reserved.","Openly confiding personal matters to complete strangers.","Effusively expressive in nearly every conversation.","Unable to keep any secret for very long.","garrulous","recalcitrant","recondite")
entry("pugnacious","adjective","advanced","Eager or quick to argue, quarrel, or fight with others.","Peaceable and quick to defuse tension and conflict.","Reluctant to defend personal interests or rights.","Accommodating even when treated quite unfairly.","pusillanimous","placid","phlegmatic")
entry("inimical","adjective","advanced","Tending to obstruct or harm and unfriendly or hostile.","Supportive and conducive to success and growth.","Warmly welcoming to newcomers and outsiders.","Mutually beneficial in nearly every interaction.","amenable","amicable","anodyne")
entry("vicarious","adjective","advanced","Experienced through the actions or feelings of another person.","Gained only through direct personal participation.","Irrelevant to anyone's lived experience or memory.","Restricted to abstract theory without real examples.","vivacious","vindictive","virulent")
entry("perfidious","adjective","advanced","Deceitful and untrustworthy and treacherous in breach of faith.","Loyal even when personal cost is high and painful.","Transparent in motive and action toward others.","Dependable across many years of close partnership.","pernicious","perspicacious","perfunctory")
entry("dilatory","adjective","advanced","Slow to act and intended to cause delay or procrastination.","Prompt and decisive at the first good opportunity.","Eager to finish tasks well ahead of all deadlines.","Unable to tolerate any waiting period at all.","diligent","decorous","defamatory")
entry("multifarious","adjective","advanced","Having great diversity or variety and composed of many elements.","Uniform and lacking meaningful variation or change.","Limited to a single narrow category of items.","Repeatedly identical in form and content throughout.","multitudinous","munificent","mendacious")
entry("sesquipedalian","adjective","advanced","Characterised by long words and given to polysyllabic lofty language.","Notably plain and monosyllabic in style and tone.","Averse to any technical terminology or jargon.","Focused on brevity above all other stylistic goals.","laconic","prolix","pellucid",'From Latin sesqui plus ped, meaning "a foot and a half long."')
entry("impetuous","adjective","advanced","Acting or done quickly without thought or care and impulsive.","Deliberate and slow to reach any firm conclusion.","Habitually cautious before taking any action.","Reluctant to move without full preparation ready.","imperious","imperturbable","impecunious")
entry("obfuscate","verb","advanced","To make something unclear, obscure, or harder to understand.","To clarify complex ideas with plain helpful examples.","To summarise lengthy material in concise clear form.","To reveal hidden facts through careful investigation.","obviate","oscillate","ossify")
entry("palimpsest","noun","advanced","A manuscript reused after earlier writing erased but still faintly visible.","A completely blank page with no prior markings at all on the sheet.","A legal document forged entirely from modern materials in a studio.","A single-author text with no revisions or changes at any stage.","perquisite","paraphernalia","panacea",'From Greek palimpsēstos, meaning "scraped again."')
entry("sycophant","noun","advanced","A person who acts obsequiously toward someone important to gain advantage.","A critic who speaks bluntly to those in power.","A mentor who challenges students to improve steadily.","A peer who treats all colleagues as complete equals.","sympathizer","soothsayer","sentinel")

for row in INTERMEDIATE_NEW + ADVANCED_NEW:
    entry(*row)


EXTERNAL_DISTRACTOR_POOL = [
    "tenacious", "tremulous", "trenchant", "turbulent", "serpentine",
    "salubrious", "sagacious", "spurious", "rambunctious", "rapacious",
    "rancorous", "refulgent", "recumbent", "multitudinous", "mellifluous",
    "luminous", "ludicrous", "liminal", "lethargic", "lissome",
    "kinetic", "jocund", "jubilant", "iridescent", "infallible",
    "indelible", "indefatigable", "imperturbable", "impecunious", "halcyon",
    "grandiloquent", "gossamer", "furtive", "fulsome", "fractious",
    "florid", "feckless", "fecund", "ethereal", "eremitic",
    "equable", "enervate", "emollient", "ebullient", "doggerel",
    "deleterious", "cursory", "cupidity", "corpulent", "churlish",
    "chicanery", "cacophony", "boorish", "beatific", "austere",
    "atavistic", "asperity", "anodyne", "amicable", "acerbic",
    "abject", "abscond", "zestful", "yonder", "winsome",
    "vitriolic", "verdant", "uxorial", "turgid", "tremulous",
    "torpid", "timorous", "tendentious", "svelte", "surreptitious",
    "sublime", "stentorian", "sojourn", "sibilant", "sententious",
    "scurrilous", "sartorial", "salubrious", "risible", "ribald",
    "reprobate", "redolent", "raconteur", "puerile", "propitious",
    "profligate", "probity", "prevaricate", "portentous", "plangent",
    "phlegmatic", "philistine", "pertinacious", "pernicious", "peremptory",
    "penurious", "panegyric", "oleaginous", "obdurate", "nefarious",
    "mordant", "minatory", "mendicant", "maudlin", "maelstrom",
    "macabre", "limpid", "lionize", "lambent", "jocose",
    "involute", "inviolable", "interlocutor", "insolent", "ineluctable",
    "ignominious", "iconoclast", "hegemony", "gourmand", "gasconade",
    "fractal", "flaccid", "fiduciary", "exiguous", "execrable",
    "equanimity", "epistolary", "encomium", "effete", "dour",
    "diurnal", "desultory", "demur", "dearth", "cynosure",
    "craven", "corporeal", "contrite", "concomitant", "clemency",
    "chary", "castigate", "calumny", "burgeon", "baleful",
    "avaricious", "ataxia", "approbation", "aphorism", "anathema",
    "amorous", "amiable", "allegory", "afflicted", "adroit",
]


def build_entries():
    vocab_words = {row[0] for row in RAW}
    usage = Counter()
    items = []
    for i, row in enumerate(RAW, start=1):
        word, pos, level, defn, dd1, dd2, dd3, dw1, dw2, dw3 = row[:10]
        ety = row[10] if len(row) > 10 else None
        # Prefer curated learning tips from vocab_explanations; fall back to inline ety
        explanation = EXPLANATIONS.get(word) or ety
        meanings = normalize_meanings([defn, dd1, dd2, dd3])
        # Rebuild meaning→word distractors from confusable/lookalike banks.
        # Ignore source dw1–dw3: they were mostly plurals and same-family stems.
        dws = assign_distractors(word, pos, vocab_words, usage)
        assert_distractors_ok(word, dws, vocab_words)
        obj = {
            "id": i,
            "word": word,
            "pos": pos,
            "level": level,
            "definition": meanings[0],
            "distractor_definitions": meanings[1:],
            "distractor_words": dws,
        }
        if explanation:
            obj["etymology"] = explanation
        items.append(obj)
    return items


def validate(items):
    errors = []
    words = [it["word"] for it in items]
    expected = len(RAW)
    if len(items) != expected:
        errors.append(f"count === {expected}: FAIL ({len(items)})")
    else:
        errors.append(f"count === {expected}: PASS")

    if len(words) != len(set(words)):
        dupes = [w for w in words if words.count(w) > 1]
        errors.append(f"unique words: FAIL duplicates {sorted(set(dupes))}")
    else:
        errors.append("unique words: PASS")

    for it in items:
        texts = [it["definition"], *it["distractor_definitions"]]
        if any(FORBIDDEN.search(t) for t in texts):
            errors.append(f"colons/semicolons: FAIL id {it['id']} word {it['word']}")
        lens = [len(t) for t in texts]
        if max(lens) - min(lens) > 12:
            errors.append(f"length spread: FAIL id {it['id']} {it['word']} spread {max(lens)-min(lens)} lens {lens}")
        if any(l < 54 or l > 72 for l in lens):
            errors.append(f"length range: FAIL id {it['id']} {it['word']} lens {lens}")
        if it["word"] in it["distractor_words"]:
            errors.append(f"distractor word: FAIL id {it['id']} includes correct word")
        if len(set(it["distractor_words"])) != 3:
            errors.append(f"distractor word: FAIL id {it['id']} not unique")
        vocab_set = {x["word"] for x in items}
        overlap = [w for w in it["distractor_words"] if w in vocab_set]
        if overlap:
            errors.append(f"distractor in vocab: FAIL id {it['id']} {it['word']}: {overlap}")
        for dw in it["distractor_words"]:
            if is_morph_relative(it["word"], dw):
                errors.append(
                    f"morph distractor: FAIL id {it['id']} {it['word']} ~ {dw}"
                )
        for t in texts:
            core = t[:-1] if t.endswith(".") else t
            if core.endswith(BAD_ENDINGS):
                errors.append(f"truncated meaning: FAIL id {it['id']} {it['word']}: {t}")

    if not any(e.endswith("FAIL") or ": FAIL" in e for e in errors[2:]):
        errors.append("colons/semicolons in definitions: PASS")
        errors.append("length spread per entry <= 12: PASS")
        errors.append("no distractor word equals correct word: PASS")

    inter = sum(1 for it in items if it["level"] == "intermediate")
    adv = sum(1 for it in items if it["level"] == "advanced")
    errors.append(f"level distribution: intermediate={inter}, advanced={adv}")

    pos_counts = {}
    for it in items:
        pos_counts[it["pos"]] = pos_counts.get(it["pos"], 0) + 1
    errors.append(f"pos distribution: {pos_counts}")

    ety = sum(1 for it in items if "etymology" in it)
    errors.append(f"etymology entries: {ety}")

    return errors


def js_string(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def render_js(items):
    lines = ["export const vocabularyData = ["]
    for it in items:
        lines.append("  {")
        lines.append(f"    id: {it['id']},")
        lines.append(f"    word: {js_string(it['word'])},")
        lines.append(f"    pos: {js_string(it['pos'])},")
        lines.append(f"    level: {js_string(it['level'])},")
        lines.append(f"    definition: {js_string(it['definition'])},")
        lines.append("    distractor_definitions: [")
        for d in it["distractor_definitions"]:
            lines.append(f"      {js_string(d)},")
        lines.append("    ],")
        lines.append("    distractor_words: [")
        for w in it["distractor_words"]:
            lines.append(f"      {js_string(w)},")
        lines.append("    ],")
        if "etymology" in it:
            lines.append(f"    etymology: {js_string(it['etymology'])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    return "\n".join(lines)


def main():
    items = build_entries()
    errors = validate(items)
    print("\n".join(errors))
    fails = [e for e in errors if "FAIL" in e]
    if fails:
        print(f"\n{len(fails)} validation failure(s).", file=sys.stderr)
        sys.exit(1)
    OUTPUT.write_text(render_js(items), encoding="utf-8")
    print(f"\nWrote {OUTPUT}")


if __name__ == "__main__":
    main()