"""
Assign meaning→word distractors that can genuinely trick a learner.

Rules:
- Never use plurals, conjugations, or other morphological variants of the target.
- Never use another headword from the vocabulary set.
- Prefer orthographic near-misses, shared openings of limited length, similar
  length/endings, and known confusable pairs — not "word / words / wording".
"""

from __future__ import annotations

import re
from collections import Counter
from difflib import SequenceMatcher

# ── Morphological rejection ──────────────────────────────────────────────────

_SUFFIXES = (
    "isation", "ization", "itious", "aceous", "aceous", "ement", "ation",
    "ition", "iness", "ility", "ality", "ivity", "atory", "atory", "ative",
    "ively", "ously", "iously", "fully", "lessly", "ingly", "edly",
    "ness", "ment", "tion", "sion", "able", "ible", "ance", "ence",
    "ancy", "ency", "ship", "hood", "dom", "ism", "ist", "ists",
    "ous", "ious", "eous", "ive", "ory", "ary", "ual", "ial", "ful",
    "less", "like", "ward", "wise", "ate", "ize", "ise", "ify",
    "ing", "ers", "est", "ies", "ied", "ier", "ily", "ely",
    "ed", "es", "ly", "er", "or", "al", "ic", "y", "s",
)

_PREFIXES = (
    "inter", "trans", "super", "under", "over", "counter", "pseudo",
    "hyper", "hypo", "semi", "anti", "auto", "mega", "micro", "multi",
    "pre", "pro", "post", "non", "dis", "mis", "un", "re", "in", "im",
    "il", "ir", "ex", "en", "em", "de", "co", "con", "com", "sub",
)


def _stem_core(word: str) -> str:
    """Rough stem: strip a couple of common affixes for comparison."""
    w = word.lower()
    for _ in range(3):
        stripped = False
        for suf in sorted(_SUFFIXES, key=len, reverse=True):
            if len(w) > len(suf) + 3 and w.endswith(suf):
                w = w[: -len(suf)]
                stripped = True
                break
        if not stripped:
            break
    for pref in sorted(_PREFIXES, key=len, reverse=True):
        if len(w) > len(pref) + 3 and w.startswith(pref):
            w = w[len(pref) :]
            break
    return w


def is_morph_relative(word: str, candidate: str) -> bool:
    """True if candidate is essentially an inflection/derivation of word (or vice versa)."""
    w = word.lower().strip()
    c = candidate.lower().strip()
    if not w or not c:
        return True
    if w == c:
        return True

    # Direct plural / possessive style
    for a, b in ((w, c), (c, w)):
        if b in {a + "s", a + "es", a + "'s", a + "s'"}:
            return True
        if a.endswith("y") and b == a[:-1] + "ies":
            return True
        if a.endswith("f") and b == a[:-1] + "ves":
            return True
        if a.endswith("fe") and b == a[:-2] + "ves":
            return True

    # One is the other plus a suffix (admonish → admonition, interlocutor → interlocutors)
    for a, b in ((w, c), (c, w)):
        if b.startswith(a) and len(b) > len(a):
            rest = b[len(a) :]
            if rest in _SUFFIXES or any(rest.endswith(s) for s in _SUFFIXES):
                return True
            # bare extension of 1–4 letters often inflectional
            if len(rest) <= 4 and rest.isalpha():
                return True
        if a.startswith(b) and len(a) > len(b):
            rest = a[len(b) :]
            if rest in _SUFFIXES or len(rest) <= 3:
                return True

    # Shared long stem after stripping affixes
    sw, sc = _stem_core(w), _stem_core(c)
    if len(sw) >= 5 and sw == sc:
        return True
    if len(sw) >= 6 and len(sc) >= 6 and (sw.startswith(sc) or sc.startswith(sw)):
        return True

    # Shared long prefix → usually same family (circumspect/circumstance,
    # admonish/admonitor, hypocrisy/hypocritical, etc.)
    if len(w) >= 5 and len(c) >= 5:
        pref = 0
        for x, y in zip(w, c):
            if x != y:
                break
            pref += 1
        if pref >= 6:
            return True
        if pref >= 5 and abs(len(w) - len(c)) <= 6:
            if SequenceMatcher(None, w, c).ratio() >= 0.72:
                return True
        # Same stem-ish: shared 5+ chars and one is adj/noun variant of other
        if pref >= 4 and SequenceMatcher(None, w, c).ratio() >= 0.82:
            return True

    return False


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            ins, delete, sub = cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (ca != cb)
            cur.append(min(ins, delete, sub))
        prev = cur
    return prev[-1]


# ── Known confusable banks (target → plausible wrong answers) ────────────────
# Only used when present; still filtered against vocab + morph rules.

CONFUSABLES: dict[str, list[str]] = {
    "inchoate": ["innate", "chaotic", "incipient"],
    "pervious": ["previous", "pervasive", "precarious"],
    "evanescent": ["effervescent", "eternal", "adolescent"],
    "fastidious": ["facetious", "factitious", "fabulous"],
    "incipient": ["insipid", "ancient", "recipient"],
    "gregarious": ["egregious", "gorgeous", "gracious"],
    "laconic": ["lactic", "chronic", "ironic"],
    "taciturn": ["tactile", "turbulent", "tacit"],
    "capricious": ["capacious", "conscious", "precious"],
    "munificent": ["magnificent", "malevolent", "magnificent"],
    "parsimonious": ["parsimonious", "perspicacious", "promising"],
    "sanguine": ["sanguinary", "genuine", "anguine"],
    "amenable": ["amiable", "amendable", "miserable"],
    "pragmatic": ["dogmatic", "dramatic", "traumatic"],
    "verbose": ["verdant", "adverse", "perverse"],
    "obstinate": ["obsequious", "ultimate", "intimate"],
    "ephemeral": ["ethereal", "eternal", "peripheral"],
    "ubiquitous": ["iniquitous", "unique", "circuitous"],
    "benevolent": ["malevolent", "turbulent", "equivalent"],
    "garrulous": ["generous", "perilous", "credulous"],
    "prolix": ["prolific", "prefix", "helix"],
    "esoteric": ["exoteric", "ecstatic", "erratic"],
    "mendacious": ["mendicant", "capacious", "tenacious"],
    "circumspect": ["introspect", "prospect", "suspect"],
    "quixotic": ["chaotic", "exotic", "quizzical"],
    "meretricious": ["meritorious", "nutritious", "malicious"],
    "recondite": ["remote", "concrete", "composite"],
    "abstruse": ["abstract", "obtuse", "profuse"],
    "perspicacious": ["precious", "capacious", "spacious"],
    "lugubrious": ["luxurious", "ludicrous", "salubrious"],
    "petulant": ["pleasant", "reluctant", "jubilant"],
    "obstreperous": ["prosperous", "onerous", "boisterous"],
    "supercilious": ["superficial", "superfluous", "delicious"],
    "pusillanimous": ["unanimous", "anonymous", "synchronous"],
    "magnanimous": ["unanimous", "anonymous", "luminous"],
    "intransigent": ["transient", "intelligent", "stringent"],
    "recalcitrant": ["reluctant", "relevant", "exultant"],
    "erudite": ["recondite", "finite", "polite"],
    "ineffable": ["inevitable", "infallible", "affable"],
    "insouciant": ["insurgent", "instant", "ancient"],
    "querulous": ["garrulous", "perilous", "fabulous"],
    "truculent": ["turbulent", "excellent", "succulent"],
    "jejune": ["genuine", "immune", "opportune"],
    "scintillating": ["titillating", "oscillating", "circulating"],
    "obsequious": ["obvious", "curious", "industrious"],
    "perfunctory": ["mandatory", "satisfactory", "introductory"],
    "assiduous": ["deciduous", "arduous", "ambiguous"],
    "voracious": ["veracious", "vivacious", "gracious"],
    "reticent": ["recent", "recipient", "competent"],
    "pugnacious": ["tenacious", "capacious", "gracious"],
    "inimical": ["chemical", "clinical", "comical"],
    "vicarious": ["various", "precarious", "nefarious"],
    "perfidious": ["pernicious", "fastidious", "insidious"],
    "dilatory": ["diligent", "military", "solitary"],
    "multifarious": ["nefarious", "various", "precarious"],
    "sesquipedalian": ["pedestrian", "valedictorian", "centenarian"],
    "impetuous": ["imperious", "contemptuous", "tempestuous"],
    "obfuscate": ["fabricate", "complicate", "extricate"],
    "palimpsest": ["parchment", "manifest", "tempest"],
    "sycophant": ["hierophant", "savant", "supplicant"],
    "interlocutor": ["interloper", "intercessor", "orator"],
    "alacrity": ["clarity", "charity", "scarcity"],
    "dichotomy": ["autonomy", "economy", "anatomy"],
    "hubris": ["hybrid", "debris", "citrus"],
    "galvanize": ["capitalize", "humanize", "scrutinize"],
    "mitigate": ["litigate", "navigate", "irrigate"],
    "abscond": ["respond", "ascend", "despond"],
    "adumbrate": ["illustrate", "moderate", "penetrate"],
    "denigrate": ["integrate", "migrate", "celebrate"],
    "equivocate": ["advocate", "allocate", "educate"],
    "eschew": ["ensue", "renew", "review"],
    "impugn": ["impute", "immune", "impair"],
    "prevaricate": ["procrastinate", "fabricate", "indicate"],
    "machiavellian": ["authoritarian", "totalitarian", "utilitarian"],
    "nascent": ["latent", "patent", "blatant"],
    "officious": ["malicious", "judicious", "fictitious"],
    "admonish": ["astonish", "diminish", "replenish"],
    "condone": ["atone", "postpone", "disown"],
    "implore": ["explore", "restore", "deplore"],
    "circumscribe": ["subscribe", "describe", "prescribe"],
    "cohesion": ["collision", "adhesion", "illusion"],
    "contention": ["convention", "invention", "detention"],
    "deference": ["reference", "preference", "inference"],
    "disparity": ["clarity", "parity", "charity"],
    "hypocrisy": ["democracy", "aristocracy", "bureaucracy"],
    "indictment": ["excitement", "inducement", "statement"],
    "inference": ["reference", "conference", "difference"],
    "notoriety": ["anxiety", "society", "propriety"],
    "propensity": ["intensity", "density", "immensity"],
    "audacious": ["capacious", "spacious", "gracious"],
    "epicurean": ["european", "caesarean", "subterranean"],
    "expeditious": ["ambitious", "superstitious", "fictitious"],
    "proscribe": ["subscribe", "describe", "inscribe"],
    "supersede": ["intercede", "concede", "precede"],
    "cupidity": ["stupidity", "rapidity", "timidity"],
    "encomium": ["compendium", "millennium", "symposium"],
    "proclivity": ["activity", "captivity", "relativity"],
    "sagacity": ["capacity", "tenacity", "audacity"],
    "apotheosis": ["hypothesis", "synthesis", "parenthesis"],
    "speciousness": ["consciousness", "righteousness", "carelessness"],

    "amorphous": ["enormous", "anonymous", "harmonious"],
    "antediluvian": ["antiquarian", "utilitarian", "vegetarian"],
    "nemesis": ["genesis", "thesis", "synthesis"],
    "vicissitude": ["altitude", "fortitude", "similitude"],
    "debunk": ["defund", "debug", "rebuke"],
    "jurisdiction": ["restriction", "conviction", "prediction"],
    "inordinate": ["subordinate", "coordinate", "ordinate"],
    "impervious": ["previous", "obvious", "serious"],
    "gainsay": ["essay", "hearsay", "soothsay"],
    "anathema": ["dilemma", "schema", "trauma"],
    "fastidious": ["insidious", "perfidious", "melodious"],
    "inchoate": ["innate", "chaotic", "private"],
    "pervious": ["previous", "pervasive", "serious"],
    "dichotomy": ["autonomy", "economy", "anatomy"],
}

# ── Large external pool (must not rely on being in the quiz set) ─────────────
# Mix of lookalike-friendly advanced/intermediate English headwords.

DISTRACTOR_BANK = """
abdicate abdomen abduct aberrant abeyance abhor abhorrent abidance abjectly ablution
abode abolish abominate aboriginal abortive abrade abridge abrupt abscess abscondence
absolute absolve absorbent abstain abstemious abstract abyss academician accede accentuate
accessional accessory acclaim acclimate acclivity accolade accommodate accomplice accord accordion
accost accoutre accredit accrue accumulate accurate accursed accusation accuse accustom
acerbate acetic achieve acidulous acknowledge acoustics acquaint acquiesce acquire acquit
acreage acrid acrimonious acrobat acronym acropolis across acrylic actuary actuate
acumen acute adage adamant adapt addict addition additive address adduce
adept adhere adhesive adieu adjacent adjective adjoin adjourn adjudge adjunct
adjure adjust adjutant admire admission admit admixture admonition adobe adolescent
adopt adorn adrift adroit adulation adult adulterant adumbration advance advantage
advent adventure adverb adversary adverse advertise advice advise advocate aerial
aesthete affair affect affidavit affiliate affinity affirm affix afflict affluence
afford affront afterthought agape agenda agglomerate aggrandize aggravate aggregate aggression
aggrieve agile agitate agony agrarian agree agriculture aimless alarm albeit
alchemy alcohol alert algebra alias alibi alien alienate alight align
alike alimentary alkali allay allegation allege allegory alleviate alley alliance
allocate allot allow alloy allure almanac almighty almost alone aloof
alphabet already altar alter altercation alternate altitude altogether altruist amalgam
amass amateur amaze ambassador amber ambidextrous ambient ambiguous ambition amble
ambrosia ambulance ambush amend amends amenity amethyst amiable amicable amiss
amity ammonia amnesia amnesty among amorous amount ampersand amphibian amphitheatre
ample amplify amplitude amputate amulet amuse anachronism anaemia anaesthesia anagram
analogue analogy analyse anarchist anatomy ancestor anchor anchovy ancient ancillary
anecdote anemia angel anger angle angriness angular animal animate anise
ankle annal annex annihilate anniversary annotate announce annoy annual annuity
annul annular anoint anomalous anonymous answer antarctic antecedent antelope antenna
anterior anthem anthology anthracite anthropoid antibiotic anticipate antidote antigen antimony
antique antiquity antiseptic antithesis antler antonym anxiety anxious anybody anyhow
anyone anything anyway anywhere aorta apace apart apartment apathetic aperture
aphoristic apiece aplomb apocalypse apocryphal apogee apologetic apology apoplexy apostle
apostrophe apothecary appal apparatus apparel apparent apparition appeal appear append
appendix appetite applaud apple appliance applicable applicant apply appoint apportion
apposite appraise appreciate apprehend apprentice approach approbate appropriate approve approximate
apricot apron apropos aquarium aquatic aqueduct aqueous aquifer arabesque arable
arbiter arbitrary arbitrate arbor arcade arcane archaeology archaic archer archetype
archipelago architect archive arctic ardent ardor arduous arena argue aristocracy
arithmetic armada armadillo armament armature armistice armour aroma around arouse
arrange array arrest arrive arrogant arrow arsenal arsenic arson artefact
artery artful article articulate artifact artifice artisan artist artless ascend
ascendant ascension ascetic ascribe aseptic ashamed ashore aside askance asleep
aspect asphalt aspirant aspire aspirin assail assassin assault assay assemble
assert assess asset assiduity assign assimilate assist associate assonance assume
assure asterisk asteroid asthma astonish astound astral astride astringent astrology
astronaut astronomy astute asunder asylum asymmetric atavism atelier atheist athlete
athwart atlas atmosphere atone atrocity attach attack attain attempt attend
attest attic attire attitude attorney attract attribute attrition attune atypical
auburn auction audible audience audit audition auditorium auditory augment augur
august auscultation auspice authentic author authority autobiography autocracy autograph automate
automobile autonomy autopsy autumn auxiliary avail avalanche avarice avenge avenue
average averse aversion avert aviary aviation avoid avuncular await awake
award aware awesome awful awkward axiom azure babble babel baboon
baccalaureate bachelor background bacon bacteria badge badger baffle baggage balance
balcony ballad ballast ballet balloon ballot bamboo banal banana bandage
bandit banish bankrupt banner banquet banter baptism barbarous barbecue barber
bargain barge barley barometer baron baroque barrack barrage barrel barren
barricade barrier barrister barrow barter baseless basement bashful basic basil
basin basis basket bassoon bastard baste batch bathe bathos baton
battalion batter battery battle bauble bayonet bazaar beach beacon beard
beast beautify beauty beaver because become bedlam beech beetle befall
befit before befriend beget beggar begin begrudge beguile behalf behave
behaviour behead behind behold behove being belabour belated belch belief
believe belittle belle belligerent bellow belly belong beloved below bemoan
bemuse bench beneath benefactor beneficial beneficiary benefit benevolence benign bequeath
bereave beret berry berserk berth beset beside besiege besmirch bestial
bestow betray better between bevel beverage bewilder beyond bible bibliography
bicameral biceps bicycle biennial bifocal bigot bilateral bilingual billiard billow
binary biography biology biped birch birth biscuit bishop bison bitter
bizarre black blackmail bladder blade blame blanch bland blank blanket
blare blaspheme blast blatant blaze bleach bleak bleat bleed blemish
blend bless blight blind blink bliss blister blithe blizzard bloat
block blockade blood bloom blossom blouse bludgeon bluff blunder blunt
blush board boast boggle bombard bombast bonfire bonnet bonus boost
booth booty border borough borrow bosom botanical botch bother bottle
bottom bough boulder bounce bound boundary bounty bouquet bourgeois bovine
bowel boycott brace bracelet brackish braid brain brake branch brand
brandy brass bravado brave bravo brawl brawn brazen breach bread
break breakfast breast breath breathe breed breeze bribe brick bridal
bridge bridle brief brigade bright brilliant brine bring brink brisk
bristle brittle broad broadcast brocade brochure broil broke broker bromide
bronze brooch brood broom broth brother brown browse bruise brunch
brunette brunt brush brusque brutal bubble buccaneer bucket buckle budget
buffalo buffer buffet buffoon bugle build bulge bullet bulletin bully
bulwark bumble bumptious bunch bundle bungalow bungle burden bureau bureaucracy
burgeon burial burlesque burly burrow burst business bustle butcher butler
butter butterfly button buttress bygone bylaw bypass bystander cabal cabbage
cabin cabinet cable cache cacophonous cadaver cadence cadet cadre cafeteria
calamity calcium calculate calendar calibre calisthenics calligraphy callous callow calorie
calve camaraderie camel camera camouflage campaign campus canal canary cancel
cancer candid candidate candle candour canine canister cannibal cannon cannot
canoe canon canopy cantankerous canteen canter canvas canyon capability capable
capacious capillary capital capitulate caprice capsule captain caption captivate captive
capture caramel carat caravan carbon carcass cardinal career careful cargo
caricature carnage carnal carnival carnivorous carol carousel carpenter carpet carriage
carrier carrot carry carte cartel cartilage carton cartoon cartridge carve
cascade cashier casino casket casserole cassette caste castle casual casualty
cataclysm catalogue catapult cataract catastrophe catch catechism categorical category cater
caterpillar cathedral catholic catkin cattle caucus caudal cauldron cauliflower causal
cause caustic cauterize caution cavalcade cavalier cavalry cavern caviar cavity
cease cedar ceiling celebrate celebrity celestial celibate cellar cello cement
cemetery censor census centaur centenary centigrade centimetre central centre centrifugal
century ceramic cereal ceremony certain certificate certify cerulean cessation cession
chafe chagrin chain chair chaise chalet chalk challenge chamber chameleon
champ champagne champion chance chancellor chandelier change channel chant chaos
chapel chaperone chaplain chapter character charade charcoal charge chariot charity
charlatan charm chart charter chary chase chasm chassis chaste chattel
chauffeur cheap cheat check cheek cheer cheese chemical chemistry cheque
cherish cherry cherub chess chest chestnut chick chicken chide chief
chiffon child chilli chime chimney chimpanzee china chink chirp chisel
chivalry chlorine chlorophyll chocolate choice choir choke cholera choose chord
chore choreography chorus chrome chronic chronicle chronology chrysalis chubby chuck
chuckle chunk church churn chute cider cigar cigarette cilia cinch
cinder cinema cinnamon cipher circa circle circuit circular circulate circumference
circumlocution circumstance circus cirrus cistern citadel citation citizen citric citron
civic civil civilian civilise clack claim clamber clammy clamorous clamp
clandestine clang clank clarify clarinet clarity clash clasp class classic
classify classmate classroom clatter clause claustrophobia clean clear cleavage cleave
cleft clench clergy clerical clerk clever cliche click client cliff
climate climax climb clime clinch cling clinic clink clique cloak
clock cloister clone close closet cloth clothe cloud clout clove
clown cluck clump clumsy cluster clutch clutter coach coagulate coalition
coarse coast cobalt cobra cobweb cocaine cochlea cockatoo cockerel cockpit
cocktail cocoa coconut cocoon coddle codify coefficient coexist coffee coffin
cogent cognac cognate cognition cognizant cohere coherent coincide colander colic
collaborate collage collapse collar collate collateral colleague collect college collide
collie collision colloquial colon colonel colonial colonnade colony color colossal
colour column combat combine combustible combustion comedy comely comet comfort
comic comma command commemorate commence commend comment commerce commission commit
committee commodity commodore common commotion communal commune communicate communion communism
community commute compact companion company compare compartment compass compassion compatible
compel compensate compete competence compile complacent complain complement complete complex
complexion complicate compliment comply component compose composite composition compost composure
compound comprehend comprehensive compress comprise compromise compulsion compute comrade concatenate
concave conceal conceit conceive concentrate concept concern concert concession conch
conciliate concise conclave conclude concoct concomitant concord concrete concur concuss
condemn condense condescend condiment condition condole conducive conduct conduit confabulate
confection confederacy confer confess confetti confidant confide confidence configure confine
confirm confiscate conflagration conflict conform confound confront confuse confute congeal
congenial congenital congest conglomerate congratulate congregate congress congruent conical conifer
conjugate conjunction conjure connect connive connoisseur connote conquer conscience conscious
conscript consecrate consecutive consensus consent consequent conserve consider consign consist
console consolidate consonant consort conspicuous conspire constant constellation consternation constitute
constrain constrict construct construe consul consult consume consummate contact contagion
contain contaminate contemplate contemporary contempt contend content contest context contiguous
continent continual continue contort contour contraband contract contradict contrary contrast
contribute contrite contrive control controvert contumacy contusion convalesce convene convenient
convent convention converge conversation converse convert convex convey convict convince
convivial convoke convoluted convoy convulse cooperate coordinate copious copper copyright
coquette coral cordial cordon corduroy corner cornet cornice corollary corona
coronary coronation coroner corporal corporate corps corpse corpus correct correlate
correspond corridor corrode corrugated corrupt corsage corset cortex coruscate cosine
cosmetic cosmic cosmogony cosmonaut cosmopolitan cosmos costume coterie cottage cotton
couch cougar cough could council counsel count countenance counter counterfeit
counterpart countervail country county couple coupon courage courier course court
courteous courtesy courtyard cousin covenant cover covet covey coward cower
coxswain coyote cozen crack crackle cradle craft cramp crane cranium
crank cranny crash crass crate crater cravat crave crawl crayon
craze crazy creak cream crease create creature credence credential credible
credit credo creed creek creel creep cremate creole creosote crepe
crescendo crescent crest cretaceous cretin crevasse crevice cricket cried crime
criminal crimp crimson cringe crinkle cripple crisis crisp crisscross criterion
critic critique croak crochet crock crocodile croft croissant crony crook
croon croquet cross crouch croup crowd crown crucial crucible crucify
crude cruel cruise crumb crumble crumpet crumple crunch crusade crush
crust crutch crypt crystal cubicle cuckoo cucumber cuddle cuisine culinary
culminate culpable culprit cultivate culture cumbersome cumin cumulative cunning cupboard
curate curator curfew curio curiosity curious currency current curriculum curry
curse cursive cursor curtain curve cushion custody custom cutaneous cuticle
cutlery cutlet cuttlefish cyanide cycle cyclone cylinder cynic cypress cytology
dabble dactyl daddy daffodil dagger dahlia daily dainty dairy daisy
dally damage damask damsel dance dandelion dandy danger dangle dapper
dappled darling dastard datum daughter daunt dawdle dazzle deacon death
debacle debar debase debate debit debonair debris debut decade decadent
decamp decant decapitate decay deceit deceive decelerate december decent decentralize
deception decide deciduous decimal decimate decipher decision declaim declare decline
declivity decoct decode decompose decorate decoy decrease decree decrepit decry
dedicate deduce deduct deface defalcate defame default defeat defect defend
defer defiant deficient deficit defile define definite deflate deflect defoliate
deform defraud defray defunct degenerate degrade degree dehydrate deify deign
deity deject delay delegate delete deliberate delicacy delicate delicious delight
delimit delineate delinquent delirious deliver delta delude deluge deluxe delve
demagogue demand demean demented demerit demesne demigod demise democracy demolish
demon demonstrate demoralize demote demure denizen denote denounce dense dental
dentist denude deodorant depart depend depict deplete deplore deploy deport
depose deposit depot deprave depreciate depress deprive depth depute deputy
derail derange derby derelict derive dermatology derogatory derrick descend describe
desert deserve design designate desire desolate despair despatch desperado desperate
despise despite despoil despond despot dessert destiny destitute destroy detach
detail detain detect deter detergent deteriorate determine detest dethrone detonate
detour detract detriment deuce devalue devastate develop deviate device devil
devise devoid devolve devote devour devout dexterity diabetes diabolic diadem
diagnose diagonal diagram dialect dialogue diameter diamond diaper diary dictate
dictionary differ difficulty diffract diffuse digest digit dignify dilapidated dilate
dilemma diligence dilute dimension diminish dimple dinghy dingy dinner dinosaur
diocese dioxide diphtheria diploma diplomat direct directory dirge disable disadvantage
disaffect disagree disallow disappear disappoint disapprove disarm disarray disaster disavow
disband disburse discard discern discharge disciple discipline disclaim disclose discomfit
discomfort disconcert disconnect disconsolate discontent discord discount discourage discourse discover
discredit discreet discrepancy discrete discriminate discuss disdain disease disembark disembodied
disenchant disengage disentangle disfigure disgrace disgruntle disguise disgust dishevel dishonest
dishonour disillusion disinclined disinfect disinherit disintegrate disinterested disjoint dislike dislocate
dislodge disloyal dismal dismantle dismay dismember dismiss dismount disobedience disorder
disown disparage disparate dispatch dispensary dispense disperse dispirit displace display
displease dispose dispossess disproportion dispute disqualify disquiet disregard disrespect disrupt
dissatisfy dissect dissemble dissertation dissident dissimilar dissimulate dissipate dissociate dissolute
dissolve dissuade distaff distance distant distaste distend distil distinct distinguish
distort distract distraught distress distribute district distrust disturb disunite disuse
ditch dither ditto ditty divan diverge diverse divert divest divide
dividend divine division divorce dizzy docile doctor document dodge doggerel
dogma dollar dolour dolphin domain domestic domicile dominant dominate domineer
dominion domino donate donkey donor doodle dormant dormitory dorsal dosage
dossier double doubt dough doughty douse dowager dowdy dowel downcast
dowry dowse dozen draft dragon drain drake drama drapery drastic
draught drawer drawl dread dream dreary dredge dregs drench dress
dribble drier drift drill drink drive drizzle droll drone drool
droop drought drove drown drowse drudge drunk dryad dubious ducal
ducat duchess duffer dugout dulcet dummy dunce dungeon duplex duplicate
durable duration duress during dwarf dwell dwindle dynamic dynamite dynamo
dynasty dysentery dyslexia dystrophy eager eagle early earnest earth easter
eaves ebony eccentric ecclesiastic echelon eclair eclipse ecology economic ecstasy
edible edict edifice edify educate eerie effect effeminate effervesce efficacious
efficient effigy effluent effort effusion egress eight eject elaborate elapse
elastic elate elbow elder elect electricity elegance elegy element elephant
elevate eleven eligible eliminate elite elixir ellipse elocution elongate elope
elucidate elude elusive elysian emaciate emanate emancipate embalm embankment embargo
embark embarrass embassy embed ember embezzle embitter emblazon emblem embody
embolden emboss embrace embroider embryo emend emerald emerge emergency emery
emetic emigrate eminence emissary emollient emotion empale emperor emphasis empire
empirical employ emporium empower empress empty emulsify enable enact enamel
enamor encamp encapsulate encase enchain enchant enclave enclose encompass encore
encounter encourage encroach encrypt encyclical encyclopedia endanger endear endeavor endemic
endive endless endorse endowment endurance endure enemy energy enfeeble enfold
enforce engage engender engine engrave engross engulf enhance enjoy enkindle
enlarge enlighten enlist enliven enmesh enmity ennoble enough enquire enrage
enrapture enrich enrol ensemble enshrine enshroud ensign enslave ensnare ensue
ensure entail entangle enter enterprise entertain enthral enthrone enthuse entice
entire entitle entity entomb entrails entrance entrap entreat entree entrench
entrepreneur entropy entrust entry entwine enunciate envelop envelope envious environment
envisage envoy enzyme epaulet epicure epidemic epidermis epigram epilepsy epilogue
episode epistle epitaph epithet epitome epoch equal equate equator equerry
equestrian equidistant equilibrium equine equinox equip equitable equity equivalent eradicate
erase erect erode erotic errand errant erratic error erupt escalate
escapade escape escarpment escort escritoire escrow escutcheon esophagus especial espionage
esplanade esquire essay essence essential establish estate esteem estimate estrange
estuary eternal ether ethics ethnic ethos etiquette etymology eucalyptus eunuch
euphemism euphoria evacuate evade evaluate evaporate evasion evening event eventual
evergreen evermore every everybody everyday everyone everything everywhere evict evidence
evince eviscerate evoke evolve exact exaggerate exalt examine example exasperate
excavate exceed excel except excerpt excess exchange excise excite exclaim
exclude excommunicate excoriate excrement excrete excruciate excursion excuse execute executive
executor exemplar exemplify exempt exercise exert exhale exhaust exhibit exhilarate
exhort exhume exile exist exodus exonerate exorbitant exorcise exotic expand
expect expectorate expedient expedition expel expend expense experience experiment expert
expire explain expletive explicit explode exploit explore explosion exponent export
expose exposition expostulate exposure expound express expunge expurgate exquisite extant
extend exterior exterminate external extinct extinguish extort extra extract extradite
extraneous extraordinary extrapolate extrasensory extravagant extreme extrinsic extrovert extrude exuberant
exude exult eyebrow eyelash eyelid eyesight eyewitness fable fabric fabulous
facade facet facial facile facsimile faction factor factory factotum faculty
faeces faggot faint fairy faith falcon fallible fallow false familiar
family famine famous fanatic fancy fantasia fantasy farce farewell farther
farthing fascinate fascism fashion fasten fatal father fathom fatigue faucet
fault fauna favour feasible feast feather feature febrile february federal
federation feeble feign feint felicity feline fellow felon female feminine
fence fender fennel ferment ferocious ferret ferric ferry fertile fervent
fervour fester festival festive fetch fetid fetish fetter fettle fetus
feudal fever fiasco fibre fickle fiction fiddle fidelity fidget field
fiend fierce fiery fiesta fifteen fifth fifty fight figment figure
filament filch filial filibuster fillet fillip filter filth final finale
finance finch finesse finger finish finite first fiscal fission fixture
flabby flagellant flagon flagrant flail flair flake flamboyant flame flank
flannel flare flash flask flatter flatulence flaunt flavour fleck fledge
fleece fleet flesh flexible flick flicker flight flimsy flinch fling
flint flippant flirt float flock flood floor floral florist floss
flotation flotilla flounce flounder flour flourish flout flower fluctuate fluent
fluff fluid fluke flume flummox flung flunk fluorescent fluoridate flurry
flush fluster flute flutter focus fodder foetus foist foliage folio
follicle follow folly football footing footpath footprint forage foray forbear
forbid force forearm forebode forecast foreclose forefather forefront foreground forehead
foreign foremost forensic forerunner foresee foreshadow foreshorten forest forever forfeit
forge forget forgive forgo forlorn formal format former formidable formula
forsake forswear forte forthcoming forthright forthwith fortify fortnight fortress fortunate
fortune forty forum forward fossil foster found foundation fountain foyer
fracas fraction fracture fragile fragment fragrant frail frame framework franchise
frank frantic fraternal fraud freak freeze freight frenetic frenzy frequent
fresco fresh friar friction friday fridge friend frieze frigate fright
frigid frill fringe frisk fritter frivolous frizz frock frolic front
frontier frost froth frown frowzy frozen fructify frugal fruit fruition
frustrate fudge fugitive fugue fulfil fulminate fulsome fumble function fundamental
funeral fungus funnel funny furbish furious furlough furnace furnish furniture
furrow further fuselage fusion futile future fuzzy gadget gaggle gaiety
galaxy gallant galleon gallery galley gallon gallop gallows galore galvanic
gambit gamble gambol gamut gander gangrene gangster gangway garage garbage
garble garden gargantuan gargle gargoyle garish garland garlic garment garner
garnet garnish garrison garter gasket gaslight gasoline gassy gastric gather
gauche gaudy gauge gaunt gauntlet gauze gavel gazette geese gelatine
gelding gender genealogy general generate generous genesis genetic genial genius
genocide genre genteel gentile gentle gentry genuine geography geology geometry
geranium german germinate gerund gestation gesticulate gesture geyser ghastly gherkin
ghetto ghost ghoul giant gibber gibbon giblet giddy gigantic giggle
gimmick ginger gingham ginseng giraffe girdle girth gizzard glacial glacier
glade gladiator glamour glance gland glare glass glaze gleam glean
glide glimmer glimpse glint glisten glitter gloat global globe globule
gloom glory gloss glossary glove gluten glutton glycerine gnarl gnash
gnome gobble goblet goblin goddess godparent goggle going goose gopher
gorge gorgeous gorilla gormandize gosling gospel gossamer gossip gothic gouge
gourd gourmet govern grace grade gradient gradual graduate graffiti graft
grain grammar gramme granary grand grandfather grandmother grandstand grange granite
granny grant granular grape graph graphic graphite grapple grasp grass
grate grateful grater gratification gratis gratitude gratuitous grave gravel gravitate
gravity gravy graze grease great greed green greet gremlin grenade
griddle grief grievance grieve grill grimace grime grind gripe grisly
grist grizzle groan grocer groin groom groove grope gross grotesque
grotto grouch ground group grouse grove grovel growl growth grudge
gruel gruesome gruff grumble grunt guarantee guard guardian guava guerrilla
guess guest guffaw guidance guide guild guile guillotine guilt guinea
guise guitar gullet gully gurgle gusto gutter guzzle gymnasium gymnastics
gypsum gypsy gyrate gyroscope haberdasher habit habitat habitation habitual hackle
haddock haemorrhage haggard haggle hallmark halter hamburger hamlet hammer hammock
hamper hamster handicap handkerchief handle handshake handsome handwriting handy hangar
hanker happen happy harass harbinger harbour hardy harem harlequin harlot
harmonic harmony harness harpoon harpsichord harpy harridan harrow harry harsh
harvest hassle haste hasty hatch hatchet hatred haughty haunch haunt
haven haversack havoc hazard headache header heading headline headlong headmaster
headquarters headstrong headway health hearse heart hearth heath heather heave
heaven heavy heckle hectic hector hedge hedgehog hefty heifer height
heinous helicopter helium helmet hemisphere hemoglobin hemorrhage hence henchman henna
hepatitis heptagon herald hereditary heresy heritage hermetic hermit hernia heroin
heron herpes hesitate hessian heterodox heterogeneous hexagon heyday hiatus hibernate
hibiscus hiccup hideous hieroglyph hijack hilarious hinder hinge hippopotamus hirsute
historian history hitch hither hoard hoarse hoary hobble hobby hobnail
hockey hoist holiday hollow holly holocaust holster homage homeopathy homesick
homework homicide homily homogeneous homonym honest honey honeymoon honor honour
horizon horizontal hormone hornet horoscope horrible horrid horror horse horticulture
hospice hospital hostage hostel hostile hotel hound house housewife housing
hovel hover hubbub huckster huddle human humane humanist humanity humble
humid humiliate humility hummock humor humus hunch hundred hunger hurdle
hurricane hurry hurtle husband husky hustings hustle hybrid hydra hydrant
hydraulic hydrocarbon hydroelectric hydrogen hyena hygiene hymen hyperbola hyperbole hyphen
hypnosis hypothesis hysteria
"""

# Flatten bank into tokens
_BANK_WORDS = sorted({w for w in re.findall(r"[a-z]+", DISTRACTOR_BANK.lower()) if len(w) >= 4})

# Index by first letter for fast candidate narrowing
_BANK_BY_LETTER: dict[str, list[str]] = {}
for _w in _BANK_WORDS:
    _BANK_BY_LETTER.setdefault(_w[0], []).append(_w)


def _pos_ending_bonus(word: str, candidate: str, pos: str) -> float:
    c = candidate.lower()
    score = 0.0
    if pos == "noun":
        for suf in ("tion", "sion", "ment", "ness", "ity", "ism", "ence", "ance", "or", "er", "ist", "ure", "age"):
            if c.endswith(suf):
                score += 1.2
                break
    elif pos == "verb":
        for suf in ("ate", "ize", "ise", "ify", "ute", "ect", "end", "ish"):
            if c.endswith(suf):
                score += 1.2
                break
    elif pos == "adjective":
        for suf in ("ous", "ive", "ent", "ant", "ful", "ial", "ical", "able", "ible", "ary", "ory", "ile"):
            if c.endswith(suf):
                score += 1.2
                break
    # Same rough ending as target (lookalike morphology of *different* roots)
    w = word.lower()
    for n in (3, 4):
        if len(w) > n and len(c) > n and w[-n:] == c[-n:]:
            score += 0.8
            break
    return score


def score_candidate(word: str, candidate: str, pos: str, usage: Counter) -> float:
    w, c = word.lower(), candidate.lower()
    if is_morph_relative(w, c):
        return -1e9

    dist = levenshtein(w, c)
    len_diff = abs(len(w) - len(c))
    ratio = SequenceMatcher(None, w, c).ratio()

    score = 0.0

    # Prefer moderate edit distance lookalikes
    if 2 <= dist <= 4:
        score += 6.0 - dist
    elif dist == 1:
        score += 3.5
    elif dist == 5:
        score += 2.0
    elif dist > 8:
        score -= 1.5

    if len_diff <= 2:
        score += 2.0
    elif len_diff <= 4:
        score += 0.8
    else:
        score -= 0.5

    # Shared short prefix is good; long shared prefix is usually same family (already filtered)
    shared = 0
    for a, b in zip(w, c):
        if a != b:
            break
        shared += 1
    if shared == 3:
        score += 2.5
    elif shared == 4:
        score += 3.0
    elif shared == 2:
        score += 1.2
    elif shared >= 5:
        score += 1.0  # weaker — morph filter should have caught true relatives

    if w[0] == c[0]:
        score += 0.8

    if 0.45 <= ratio <= 0.75:
        score += 2.0
    elif ratio > 0.85:
        score -= 2.0  # too close — likely family

    score += _pos_ending_bonus(w, c, pos)

    # Mild penalty for overused distractors
    score -= usage[c] * 0.35

    # Prefer mid-length academic-looking words
    if 6 <= len(c) <= 12:
        score += 0.6

    # Down-rank obscure nautical/archaic micro-words that rarely confuse learners
    if c in {
        "abaft", "abase", "abash", "abatis", "abbess", "abbot", "abode",
        "aloft", "anent", "yclept", "wont", "yonder",
    }:
        score -= 5.0

    return score


def _narrow_candidates(word: str, blocked: set[str]) -> list[str]:
    """Orthographic near-misses + same-letter peers (not the full bank)."""
    w = word.lower()
    out: list[str] = []
    seen: set[str] = set()

    def add(c: str) -> None:
        if c in seen or c in blocked or is_morph_relative(w, c):
            return
        # skip ultra-common short function-ish words
        if len(c) < 5:
            return
        # Prefer academic-ish length; avoid tiny fillers
        if abs(len(c) - len(w)) > 6:
            return
        seen.add(c)
        out.append(c)

    # Same initial letter, similar length
    for c in _BANK_BY_LETTER.get(w[0], []):
        if abs(len(c) - len(w)) <= 5:
            add(c)

    # Adjacent alphabet letters for more variety
    ord0 = ord(w[0])
    for delta in (-1, 1, 2, -2, 3, -3):
        ch = chr(ord0 + delta)
        if "a" <= ch <= "z":
            for c in _BANK_BY_LETTER.get(ch, []):
                if abs(len(c) - len(w)) <= 4:
                    add(c)

    # Shared 3-letter prefix via same first letter
    if len(w) >= 4:
        pref = w[:3]
        for c in _BANK_BY_LETTER.get(w[0], []):
            if c.startswith(pref):
                add(c)

    # For long rare words, cast a wider net by length band across the whole bank
    if len(w) >= 10 or len(out) < 40:
        lo, hi = max(5, len(w) - 3), len(w) + 3
        for c in _BANK_WORDS:
            if lo <= len(c) <= hi:
                add(c)

    return out


def assign_distractors(
    word: str,
    pos: str,
    vocab_words: set[str],
    usage: Counter | None = None,
    preferred: list[str] | None = None,
) -> list[str]:
    """Return three distinct, non-morphological distractor headwords."""
    if usage is None:
        usage = Counter()

    vocab_l = {v.lower() for v in vocab_words}
    w = word.lower()

    blocked = set(vocab_l)
    blocked.add(w)

    candidates: list[str] = []
    seen: set[str] = set()

    def push(c: str, boost: float = 0.0) -> None:
        cl = c.lower()
        if cl in seen or cl in blocked or is_morph_relative(w, cl):
            return
        if len(cl) < 4:
            return
        seen.add(cl)
        candidates.append((cl, boost))

    # 1) curated confusables (strong boost)
    for c in CONFUSABLES.get(w, []) + list(preferred or []):
        push(c, boost=8.0)

    # 2) orthographic near-miss pool
    for c in _narrow_candidates(w, blocked):
        push(c, boost=0.0)

    # Score and pick
    scored = []
    for c, boost in candidates:
        s = score_candidate(w, c, pos, usage) + boost
        if s > -1e8:
            scored.append((s, c))

    scored.sort(key=lambda t: (-t[0], t[1]))

    picked: list[str] = []
    for s, c in scored:
        if c in picked or is_morph_relative(w, c):
            continue
        if any(is_morph_relative(c, p) for p in picked):
            continue
        # Avoid three options that all share the exact same 4-letter prefix
        if len(picked) >= 1 and all(c[:4] == p[:4] for p in picked if len(p) >= 4):
            if len(c) >= 4 and all(c[:4] == p[:4] for p in picked):
                continue
        picked.append(c)
        usage[c] += 1
        if len(picked) == 3:
            break

    if len(picked) < 3:
        # emergency: scan same-letter bank then full bank
        for source in (
            _BANK_BY_LETTER.get(w[0], []),
            _BANK_WORDS,
        ):
            for c in source:
                if c in blocked or c in picked or is_morph_relative(w, c):
                    continue
                if any(is_morph_relative(c, p) for p in picked):
                    continue
                picked.append(c)
                usage[c] += 1
                if len(picked) == 3:
                    break
            if len(picked) == 3:
                break

    if len(picked) != 3:
        raise ValueError(f"Could not assign 3 distractors for {word!r} (got {picked})")

    return picked


def assert_distractors_ok(word: str, distractors: list[str], vocab_words: set[str]) -> None:
    vocab_l = {v.lower() for v in vocab_words}
    w = word.lower()
    assert len(distractors) == 3, distractors
    assert len(set(d.lower() for d in distractors)) == 3, distractors
    for d in distractors:
        assert d.lower() != w
        assert d.lower() not in vocab_l, f"{d} is a vocab headword"
        assert not is_morph_relative(w, d), f"{d} morph-related to {w}"
