/* ============================================================================
 * Fluentia — Level Test item bank
 * ----------------------------------------------------------------------------
 * Every item is tagged with:
 *   lvl   0 = Pre-A1 · 1 = A1 · 2 = A2 · 3 = B1 · 4 = B2 · 5 = C1
 *   skill grammar | vocab | reading | use | listening
 *   d     difficulty WITHIN the level: -1 easy · 0 mid · +1 hard
 *
 * The IRT difficulty (b) is derived in engine.js from (lvl, d) so the whole
 * scale can be re-tuned in one place instead of editing 120 numbers.
 *
 * ⚠ THE CORRECT ANSWER IS ALWAYS opts[0].
 * Options are Fisher–Yates shuffled at serve time by engine.js#serve().
 * This mirrors the LMS placement bank — and the bug it once had: the bank
 * stored the answer first AND served it unshuffled, so "always tap A" scored
 * C1. Never render option letters from the source index; badge by position.
 * ========================================================================== */

const q = (id, lvl, skill, d, text, opts) => ({ id, lvl, skill, d, text, opts });

/* ─────────────────────────────────────────────────────────────────────────────
 * L0 — Pre-A1 · «ما قبل الخطوة الأولى»
 * Absolute beginner. Arabic support inside the options is allowed here only.
 * ─────────────────────────────────────────────────────────────────────────── */
const L0 = [
  q('g-l0-1', 0, 'grammar', -1, 'I ___ a student.', ['am', 'is', 'are', 'be']),
  q('g-l0-2', 0, 'grammar', -1, 'This ___ my book.', ['is', 'are', 'am', 'be']),
  q('g-l0-3', 0, 'grammar', 0, '___ name is Sara.', ['My', 'Me', 'I', 'Mine']),
  q('g-l0-4', 0, 'grammar', 0, 'She ___ from Egypt.', ['is', 'are', 'am', 'do']),
  q('g-l0-5', 0, 'grammar', 0, '___ you a teacher?', ['Are', 'Is', 'Am', 'Do']),
  q('g-l0-6', 0, 'grammar', 1, 'I have two ___.', ['brothers', 'brother', 'a brother', 'brotheres']),

  q('v-l0-1', 0, 'vocab', -1, 'What does "water" mean?', ['ماء', 'حليب', 'خبز', 'شاي']),
  q('v-l0-2', 0, 'vocab', -1, 'Which one is a colour?', ['Blue', 'Chair', 'Walk', 'Sunday']),
  q('v-l0-3', 0, 'vocab', 0, 'Which word is a number?', ['Seven', 'Sister', 'Silver', 'Summer']),
  q('v-l0-4', 0, 'vocab', 0, 'What does "doctor" mean?', ['طبيب', 'مهندس', 'معلّم', 'طالب']),
  q('v-l0-5', 0, 'vocab', 1, 'Which one is a day of the week?', ['Monday', 'March', 'Morning', 'Minute']),

  q('u-l0-1', 0, 'use', -1, 'Someone says "Thank you." You say:', [
    "You're welcome.", 'I am fine.', 'Yes, please.', 'Good night.',
  ]),
  q('u-l0-2', 0, 'use', 0, 'You meet your teacher at 8 a.m. You say:', [
    'Good morning.', 'Good night.', 'Goodbye.', 'Good luck.',
  ]),
];

const L0_PASSAGE = {
  id: 'p-l0-1', lvl: 0, d: 0,
  text: 'My name is Omar. I am ten years old. I live in Jeddah with my family. I like football.',
  items: [
    q('p-l0-1a', 0, 'reading', -1, 'How old is Omar?', ['Ten', 'Eleven', 'Nine', 'Twelve']),
    q('p-l0-1b', 0, 'reading', 0, 'Where does Omar live?', ['In Jeddah', 'In Riyadh', 'In Egypt', 'With his teacher']),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * L1 — A1 · «الخطوة الأولى»
 * ─────────────────────────────────────────────────────────────────────────── */
const L1 = [
  q('g-l1-1', 1, 'grammar', -1, 'She ___ to school every day.', ['goes', 'go', 'going', 'gone']),
  q('g-l1-2', 1, 'grammar', -1, 'They ___ from Saudi Arabia.', ['are', 'is', 'am', 'be']),
  q('g-l1-3', 1, 'grammar', 0, 'There ___ three books on the table.', ['are', 'is', 'has', 'be']),
  q('g-l1-4', 1, 'grammar', 0, 'I don\'t ___ coffee.', ['like', 'likes', 'liking', 'liked']),
  q('g-l1-5', 1, 'grammar', 0, 'He is ___ engineer.', ['an', 'a', 'the', 'one']),
  q('g-l1-6', 1, 'grammar', 1, 'Where ___ you live?', ['do', 'are', 'is', 'does']),
  q('g-l1-7', 1, 'grammar', 1, 'My sister ___ TV now.', ['is watching', 'watch', 'watches', 'watching']),

  q('v-l1-1', 1, 'vocab', -1, 'The opposite of "hot" is:', ['cold', 'warm', 'big', 'fast']),
  q('v-l1-2', 1, 'vocab', -1, 'You sleep in a ___.', ['bedroom', 'kitchen', 'garden', 'office']),
  q('v-l1-3', 1, 'vocab', 0, '"Cheap" means:', ['not expensive', 'very big', 'very fast', 'difficult']),
  q('v-l1-4', 1, 'vocab', 0, 'You buy food at the ___.', ['supermarket', 'library', 'hospital', 'airport']),
  q('v-l1-5', 1, 'vocab', 1, 'Which word is a job?', ['nurse', 'winter', 'heavy', 'kitchen']),

  q('u-l1-1', 1, 'use', -1, 'Someone asks "How are you?" You reply:', [
    "I'm fine, thanks.", 'I am 25 years old.', 'My name is Ali.', 'Yes, please.',
  ]),
  q('u-l1-2', 1, 'use', 0, 'You want to know the price. You ask:', [
    'How much is this?', 'How many is this?', 'What is price this?', 'How much cost?',
  ]),
  q('u-l1-3', 1, 'use', 1, 'You did not understand. You say:', [
    'Sorry, could you repeat that?', 'Repeat again one more.', 'I no understand you say.', 'Say it two times please now.',
  ]),
];

const L1_PASSAGE = {
  id: 'p-l1-1', lvl: 1, d: 0,
  text: "Hi Sara,\n\nI'm sorry, I can't come to your party on Friday. I have to work until 9 p.m. Can we meet next week instead? I'm free on Sunday.\n\nAhmed",
  items: [
    q('p-l1-1a', 1, 'reading', -1, "Why can't Ahmed come to the party?", [
      'He has to work.', 'He is ill.', 'He is travelling.', "He doesn't like parties.",
    ]),
    q('p-l1-1b', 1, 'reading', 0, 'What does Ahmed suggest?', [
      'Meeting on Sunday.', 'Coming late to the party.', 'Cancelling the party.', 'Calling Sara on Friday.',
    ]),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * L2 — A2 · «بداية الثقة»
 * ─────────────────────────────────────────────────────────────────────────── */
const L2 = [
  q('g-l2-1', 2, 'grammar', -1, 'Yesterday I ___ to the market.', ['went', 'go', 'goes', 'gone']),
  q('g-l2-2', 2, 'grammar', -1, 'This car is ___ than that one.', ['faster', 'fast', 'fastest', 'more fast']),
  q('g-l2-3', 2, 'grammar', 0, "I'm going to ___ my friend tonight.", ['meet', 'meeting', 'met', 'meets']),
  q('g-l2-4', 2, 'grammar', 0, "There isn't ___ milk in the fridge.", ['any', 'some', 'a', 'many']),
  q('g-l2-5', 2, 'grammar', 0, 'We ___ watching TV when he called.', ['were', 'was', 'are', 'been']),
  q('g-l2-6', 2, 'grammar', 1, 'She has ___ finished her homework.', ['already', 'yet', 'since', 'ago']),
  q('g-l2-7', 2, 'grammar', 1, 'If you ___ hungry, eat something.', ['are', 'will be', 'were', 'would be']),
  q('g-l2-8', 2, 'grammar', 1, 'He is good at ___ football.', ['playing', 'play', 'to play', 'played']),

  q('v-l2-1', 2, 'vocab', -1, '"I was exhausted after the trip." — I was very:', ['tired', 'hungry', 'happy', 'angry']),
  q('v-l2-2', 2, 'vocab', 0, 'The opposite of "arrive" is:', ['leave', 'stay', 'enter', 'return']),
  q('v-l2-3', 2, 'vocab', 0, 'A person who fixes cars is a ___.', ['mechanic', 'plumber', 'carpenter', 'chef']),
  q('v-l2-4', 2, 'vocab', 0, '"The street is crowded." — There are many ___.', ['people', 'shops', 'prices', 'hours']),
  q('v-l2-5', 2, 'vocab', 1, '"Borrow" means:', [
    'to take something and give it back later', 'to give something and keep it', 'to buy something new', 'to lose something',
  ]),

  q('u-l2-1', 2, 'use', -1, "You are late for a meeting. What's the best thing to say?", [
    "Sorry I'm late — there was a lot of traffic.", 'Hi, I late. Bye.', 'Traffic bad too much.', 'Late me, yes, sorry.',
  ]),
  q('u-l2-2', 2, 'use', 1, 'Your manager asks: "Could you send the report by 5?" You reply:', [
    "Sure, I'll send it before 5.", 'Yes, I send it before 5 maybe.', 'OK, I am sending it yesterday.', 'Of course, I sent it tomorrow.',
  ]),
];

const L2_PASSAGE = {
  id: 'p-l2-1', lvl: 2, d: 0,
  text: 'NOTICE\n\nThe swimming pool will be closed all day on Saturday for cleaning. It will open again on Sunday at 7 a.m. Members who booked a lesson on Saturday can use it free of charge next week.\n\nWe are sorry for any inconvenience.',
  items: [
    q('p-l2-1a', 2, 'reading', -1, 'Why is the pool closed?', [
      'It is being cleaned.', 'It is being repaired.', 'It is a public holiday.', 'There are no members.',
    ]),
    q('p-l2-1b', 2, 'reading', 0, 'When can people swim again?', [
      'Sunday morning.', 'Saturday evening.', 'Sunday night.', 'Next week only.',
    ]),
    q('p-l2-1c', 2, 'reading', 1, 'What happens to a lesson booked for Saturday?', [
      'It can be taken next week at no extra cost.', 'The money is lost.', 'It moves to Sunday at 7 a.m.', 'It must be paid for again.',
    ]),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * L3 — B1 · «صار يتكلم»
 * ─────────────────────────────────────────────────────────────────────────── */
const L3 = [
  q('g-l3-1', 3, 'grammar', -1, 'I ___ in Riyadh for five years, and I still live here.', [
    'have lived', 'am living', 'lived', 'live',
  ]),
  q('g-l3-2', 3, 'grammar', -1, 'If it rains tomorrow, we ___ at home.', ['will stay', 'stay', 'stayed', 'would stay']),
  q('g-l3-3', 3, 'grammar', 0, 'The meeting ___ because of the weather.', [
    'was cancelled', 'cancelled', 'is cancelling', 'has cancelling',
  ]),
  q('g-l3-4', 3, 'grammar', 0, 'He asked me where I ___.', ['worked', 'do work', 'am working', 'work']),
  q('g-l3-5', 3, 'grammar', 0, "I'm used to ___ early.", ['getting up', 'get up', 'got up', 'be get up']),
  q('g-l3-6', 3, 'grammar', 1, 'You ___ told him — it was a secret.', [
    "shouldn't have", "shouldn't", "mustn't", "didn't have to",
  ]),
  q('g-l3-7', 3, 'grammar', 1, 'This is the colleague ___ helped me with the project.', ['who', 'which', 'whose', 'what']),
  q('g-l3-8', 3, 'grammar', 1, 'I wish I ___ more time to prepare.', ['had', 'have', 'will have', 'am having']),

  q('v-l3-1', 3, 'vocab', -1, 'Despite the rain, we ___ the trip.', ['enjoyed', 'cancelled', 'forgot', 'bought']),
  q('v-l3-2', 3, 'vocab', 0, '"Postpone" means:', [
    'move to a later time', 'cancel completely', 'attend on time', 'start earlier',
  ]),
  q('v-l3-3', 3, 'vocab', 0, '"She\'s reliable." — You can ___ her.', ['depend on', 'laugh at', 'look for', 'give up']),
  q('v-l3-4', 3, 'vocab', 0, 'At the end of the month he receives his ___.', ['salary', 'price', 'cost', 'bill']),
  q('v-l3-5', 3, 'vocab', 1, '"They get along well." — They:', [
    'have a good relationship', 'meet by chance', 'argue often', 'travel together',
  ]),
  q('v-l3-6', 3, 'vocab', 1, '"The instructions were confusing." — They were:', [
    'hard to understand', 'very detailed', 'written badly by hand', 'too short to read',
  ]),

  q('u-l3-1', 3, 'use', 0, 'You are writing a formal email to someone you have never met. You begin:', [
    'Dear Mr. Khan,', 'Hi buddy,', 'Hello you,', 'To you,',
  ]),
  q('u-l3-2', 3, 'use', 1, 'In a meeting you disagree with a colleague. The most professional reply is:', [
    "I see your point, but I'd suggest a different approach.", 'You are wrong.', "No, that's a bad idea.", "I don't agree with you never.",
  ]),
];

const L3_PASSAGE = {
  id: 'p-l3-1', lvl: 3, d: 0,
  text: 'Many companies now allow employees to work from home two days a week. Managers say the arrangement makes staff happier and reduces the cost of office space. Some workers, however, complain that they feel isolated and that it is harder to ask a quick question when nobody is sitting next to them. A recent survey found that most employees do not want to choose between the two: they want a mixture of days at home and days in the office.',
  items: [
    q('p-l3-1a', 3, 'reading', -1, 'Why do companies like this arrangement?', [
      'It saves money on office space.', 'It increases sales.', 'Employees work longer hours.', 'The law requires it.',
    ]),
    q('p-l3-1b', 3, 'reading', 0, 'What problem do some workers mention?', [
      'They feel cut off from other people.', 'Their internet is slow.', 'Meetings became longer.', 'Their pay was reduced.',
    ]),
    q('p-l3-1c', 3, 'reading', 1, 'What do most employees in the survey prefer?', [
      'A mixture of home and office days.', 'Working only from home.', 'Working only in the office.', 'Changing companies.',
    ]),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * L4 — B2 · «ثقة كاملة»
 * ─────────────────────────────────────────────────────────────────────────── */
const L4 = [
  q('g-l4-1', 4, 'grammar', -1, 'The report ___ by the manager yesterday.', [
    'was written', 'wrote', 'is writing', 'has written',
  ]),
  q('g-l4-2', 4, 'grammar', -1, 'If I ___ more time, I would travel more.', ['had', 'have', 'will have', 'would have']),
  q('g-l4-3', 4, 'grammar', 0, 'By the time we arrived, the film ___.', [
    'had started', 'has started', 'started', 'was starting',
  ]),
  q('g-l4-4', 4, 'grammar', 0, 'She denied ___ the email.', ['sending', 'to send', 'send', 'sent']),
  q('g-l4-5', 4, 'grammar', 0, 'Neither of the proposals ___ acceptable.', ['is', 'are', 'were', 'have been']),
  q('g-l4-6', 4, 'grammar', 1, 'Not only ___ late, but he also forgot the documents.', [
    'was he', 'he was', 'he is', 'did he',
  ]),
  q('g-l4-7', 4, 'grammar', 1, "I'd rather you ___ tell anyone about this.", ["didn't", "don't", "won't", "wouldn't"]),
  q('g-l4-8', 4, 'grammar', 1, 'The project is worth ___ despite the cost.', ['doing', 'to do', 'do', 'done']),

  q('v-l4-1', 4, 'vocab', -1, '"She tends to procrastinate." — She usually:', [
    'delays doing things', 'works hard early', 'forgets deadlines', 'asks for help',
  ]),
  q('v-l4-2', 4, 'vocab', 0, '"He was reluctant to agree." — He was:', ['unwilling', 'eager', 'unable', 'forced']),
  q('v-l4-3', 4, 'vocab', 0, '"A thorough investigation" is one that is:', [
    'careful and complete', 'quick and cheap', 'secret', 'official',
  ]),
  q('v-l4-4', 4, 'vocab', 1, '"The results were inconclusive." — They:', [
    'did not prove anything clearly', 'were very clear', 'were extremely positive', 'were rejected by everyone',
  ]),
  q('v-l4-5', 4, 'vocab', 1, '"This policy will undermine trust." — It will ___ trust.', [
    'weaken', 'strengthen', 'explain', 'measure',
  ]),
  q('v-l4-6', 4, 'vocab', 1, '"We need to allocate more resources." — We need to ___ them.', [
    'assign', 'reduce', 'borrow', 'count',
  ]),

  q('u-l4-1', 4, 'use', 0, 'In a formal email, you are declining a job offer. The best phrase is:', [
    'After careful consideration, I must respectfully decline.', "No thanks, I don't want it.", 'I changed my mind, sorry.', 'Maybe next time, not now.',
  ]),
  q('u-l4-2', 4, 'use', 1, 'You must tell a client you will miss a deadline. The most appropriate opening is:', [
    "I'm afraid we won't be able to meet the original deadline.", "We can't do it.", 'That deadline is impossible for us.', 'No, the deadline is finished.',
  ]),
];

const L4_PASSAGE = {
  id: 'p-l4-1', lvl: 4, d: 0,
  text: 'When a company launches a product too early, the damage is rarely limited to the launch itself. Customers who encounter obvious faults tend to assume that the fault lies with the brand as a whole rather than with a single release, and that impression is remarkably difficult to reverse. Marketing teams often respond by increasing advertising, but the evidence suggests that additional spending achieves very little once trust has been lost. The more effective strategy — though invariably the least popular inside the company — is to delay, repair the underlying problems, and re-launch quietly.',
  items: [
    q('p-l4-1a', 4, 'reading', -1, 'According to the writer, what is the main risk of launching too early?', [
      "Lasting damage to the brand's reputation.", 'A reduction in advertising budgets.', 'Losing experienced staff.', 'Legal action from customers.',
    ]),
    q('p-l4-1b', 4, 'reading', 0, 'What does the writer say about spending more on advertising?', [
      'It accomplishes little once trust is gone.', 'It usually solves the problem.', 'It is cheaper than delaying.', 'It should be done before the launch.',
    ]),
    q('p-l4-1c', 4, 'reading', 1, '"the least popular inside the company" suggests that the strategy is:', [
      'disliked by the company\'s own people', 'unknown to customers', 'expensive to carry out', 'illegal in some markets',
    ]),
    q('p-l4-1d', 4, 'reading', 1, "The writer's attitude towards delaying a launch is:", [
      'supportive', 'critical', 'indifferent', 'uncertain',
    ]),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * L5 — C1 · «جاهز للعالم»
 * ─────────────────────────────────────────────────────────────────────────── */
const L5 = [
  q('g-l5-1', 5, 'grammar', -1, 'Rarely ___ such dedication in a young employee.', [
    'have I seen', 'I have seen', 'I saw', 'did I saw',
  ]),
  q('g-l5-2', 5, 'grammar', 0, 'Had the board anticipated the downturn, they ___ the portfolio.', [
    'would have diversified', 'would diversify', 'had diversified', 'will diversify',
  ]),
  q('g-l5-3', 5, 'grammar', 0, 'No sooner ___ the announcement than the shares fell.', [
    'had they made', 'they had made', 'did they make', 'they made',
  ]),
  q('g-l5-4', 5, 'grammar', 1, "___ for the delay, the project would have finished on budget.", [
    'Had it not been', 'If it was not', 'Had not it been', 'Were not it',
  ]),
  q('g-l5-5', 5, 'grammar', 1, "The committee's decision, ___ controversial, was final.", [
    'however', 'although', 'despite', 'whatever',
  ]),
  q('g-l5-6', 5, 'grammar', 1, 'He objected to ___ consulted before the decision was announced.', [
    'not being', 'not be', 'not to be', 'do not be',
  ]),

  q('v-l5-1', 5, 'vocab', -1, '"His argument was compelling but ultimately flawed." — It was:', [
    'convincing, yet it contained mistakes', 'boring and completely wrong', 'perfect and widely accepted', 'rejected before it was heard',
  ]),
  q('v-l5-2', 5, 'vocab', 0, '"The evidence is scant." — There is:', [
    'very little of it', 'a great deal of it', 'contradictory evidence', 'very recent evidence',
  ]),
  q('v-l5-3', 5, 'vocab', 0, '"She was appointed in an interim capacity." — She was appointed:', [
    'temporarily', 'permanently', 'secretly', 'without pay',
  ]),
  q('v-l5-4', 5, 'vocab', 1, '"This tends to exacerbate the problem." — It tends to:', [
    'make it worse', 'solve it', 'conceal it', 'measure it',
  ]),
  q('v-l5-5', 5, 'vocab', 1, '"A tacit agreement" is one that is:', [
    'understood without being stated', 'written and signed', 'publicly announced', 'legally enforceable',
  ]),
  q('v-l5-6', 5, 'vocab', 1, '"The findings are at odds with earlier research." — They:', [
    'conflict with it', 'confirm it', 'extend it', 'replace it entirely',
  ]),

  q('u-l5-1', 5, 'use', 0, 'You are chairing a meeting and a speaker has talked for too long. The most diplomatic move is:', [
    "I'd like to come back to that — but let's hear from the others first.", 'Please stop talking now.', 'You talk too much.', 'Enough. Next person.',
  ]),
  q('u-l5-2', 5, 'use', 1, 'In a formal report, the most appropriately hedged claim is:', [
    'The data suggest that costs may rise.', 'Costs will rise, definitely.', 'Costs are going to rise 100%.', 'Maybe costs, I think, will rise.',
  ]),
];

const L5_PASSAGE = {
  id: 'p-l5-1', lvl: 5, d: 0,
  text: 'The assumption that expertise transfers neatly from one domain to another has proved surprisingly durable, despite consistent evidence to the contrary. A surgeon\'s judgement under pressure does not make them a competent investor; a celebrated novelist is not thereby qualified to design a school curriculum. What does travel between fields is not knowledge but a set of habits — a willingness to be corrected, the discipline of revision, a tolerance for being a beginner again — and these are considerably less glamorous than the expertise they support. Institutions that recruit on reputation alone tend to discover this late, and at considerable cost.',
  items: [
    q('p-l5-1a', 5, 'reading', 0, "The writer's main point is that:", [
      'expertise rarely transfers between different fields', 'experts are usually wrong about their own field', 'reputation has no value at all', 'surgeons in particular make poor investors',
    ]),
    q('p-l5-1b', 5, 'reading', 0, '"What does travel between fields" refers to:', [
      'transferable working habits', 'technical knowledge', 'professional titles', 'financial reward',
    ]),
    q('p-l5-1c', 5, 'reading', 1, 'In this text, "durable" could best be replaced by:', [
      'persistent', 'fragile', 'recent', 'popular',
    ]),
    q('p-l5-1d', 5, 'reading', 1, 'The tone of the final sentence is:', [
      'quietly critical', 'openly admiring', 'entirely neutral', 'light-hearted',
    ]),
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Listening — spoken by the device voice (Web Speech API).
 * `say` is NEVER rendered on screen. Two items per level so repeat visitors
 * don't get the same pair.
 * ─────────────────────────────────────────────────────────────────────────── */
export const LISTENING = [
  {
    ...q('l-l0-1', 0, 'listening', 0, 'Where is the book?', ['On the table', 'Under the chair', 'In the bag', 'On the floor']),
    say: 'The book is on the table.',
  },
  {
    ...q('l-l0-2', 0, 'listening', 0, 'What colour is the car?', ['Red', 'Blue', 'Black', 'White']),
    say: 'My father has a red car.',
  },
  {
    ...q('l-l1-1', 1, 'listening', 0, 'When does the speaker have breakfast?', ['At 7:30', 'At 7:00', 'At 8:00', 'At 6:30']),
    say: 'I usually get up at seven, and I have breakfast at half past seven.',
  },
  {
    ...q('l-l1-2', 1, 'listening', 0, 'How does the speaker go to work?', ['By bus', 'By car', 'On foot', 'By train']),
    say: "I don't drive, so I take the bus to work every morning.",
  },
  {
    ...q('l-l2-1', 2, 'listening', 0, 'Which platform will the train leave from?', ['Platform four', 'Platform twenty', 'Platform two', 'Platform fourteen']),
    say: 'Attention please. The train to Dammam has been delayed by twenty minutes, and it will now leave from platform four.',
  },
  {
    ...q('l-l2-2', 2, 'listening', 0, 'What does the speaker want to do?', ['Change the appointment', 'Cancel the appointment', 'Confirm the address', 'Pay in advance']),
    say: "Hello, this is Noura. I have an appointment on Tuesday at four, but something has come up. Could I move it to Wednesday?",
  },
  {
    ...q('l-l3-1', 3, 'listening', 0, 'What has the speaker decided to do?', ['Phone the company', 'Apply for the job again', 'Wait another month', 'Accept a different job']),
    say: "I applied for the job last month, but I still haven't heard anything. I think I'll give them a call tomorrow.",
  },
  {
    ...q('l-l3-2', 3, 'listening', 0, 'Why was the speaker late?', ['The meeting before it ran over', 'The traffic was bad', 'He forgot the time', 'His car broke down']),
    say: "Sorry I'm late — my previous meeting ran over by half an hour and I couldn't get away.",
  },
  {
    ...q('l-l4-1', 4, 'listening', 0, 'What does the speaker prefer?', [
      'Not making the testing team work at the weekend', 'Moving the deadline to Thursday', 'Cancelling the testing entirely', 'Hiring additional testers',
    ]),
    say: "We could push the deadline to Thursday, though that would mean the testing team working over the weekend — which, frankly, I'd rather avoid.",
  },
  {
    ...q('l-l4-2', 4, 'listening', 0, 'What is the speaker doing?', [
      'Politely rejecting the proposal', 'Fully supporting the proposal', 'Asking for more data', 'Postponing the decision',
    ]),
    say: "It's an interesting proposal, and I can see the thinking behind it — but I don't think the numbers really support it at this stage.",
  },
  {
    ...q('l-l5-1', 5, 'listening', 0, 'What is the speaker implying?', [
      'The failure was not Nadia\'s fault', 'Nadia ignored the risk', 'The client was being unreasonable', 'Nadia should have complained sooner',
    ]),
    say: "To be fair to Nadia, she did flag the risk early on. The problem was that nobody acted on it until the client complained.",
  },
  {
    ...q('l-l5-2', 5, 'listening', 0, "What is the speaker's view of the new process?", [
      'It solves one problem but creates another', 'It is a complete success', 'It should be abandoned immediately', 'It is too early to judge it',
    ]),
    say: "The new process has certainly cut the approval time, I'll grant you that — but it's simply moved the bottleneck further down the line.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
 * Writing — one prompt, chosen by the estimated band. Not auto-graded:
 * it is captured verbatim as evidence for the human placement conversation.
 * ─────────────────────────────────────────────────────────────────────────── */
export const WRITING = [
  {
    band: 'low', maxLvl: 1, minWords: 12,
    ar: 'اكتب من جملتين إلى ثلاث جمل بالإنجليزي عن نفسك: اسمك، من وين أنت، ووش تحب تسوي.',
    en: 'Write 2–3 sentences in English about yourself: your name, where you are from, and what you like doing.',
    placeholder: 'My name is…',
  },
  {
    band: 'mid', maxLvl: 3, minWords: 25,
    ar: 'اكتب من ثلاث إلى أربع جمل بالإنجليزي عن يوم عادي في شغلك أو دراستك — وش تسوي، ومتى، ووش أصعب شي فيه.',
    en: 'Write 3–4 sentences in English about a normal day at your work or your studies — what you do, when, and what the hardest part is.',
    placeholder: 'On a normal day, I…',
  },
  {
    band: 'high', maxLvl: 5, minWords: 45,
    ar: 'اكتب من أربع إلى ست جمل بالإنجليزي: بعض الشركات تسمح لموظفيها بالعمل من البيت. هل تشوف هذا قرار صحيح؟ وليش؟',
    en: 'Write 4–6 sentences in English: some companies allow their employees to work from home. Do you think this is a good decision? Why?',
    placeholder: 'In my opinion,…',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
 * Assembly — passages are expanded into individual items that carry their
 * source text, so the reader stays on screen while its questions are answered.
 * ─────────────────────────────────────────────────────────────────────────── */
const PASSAGES = [L0_PASSAGE, L1_PASSAGE, L2_PASSAGE, L3_PASSAGE, L4_PASSAGE, L5_PASSAGE];

const expandedPassageItems = PASSAGES.flatMap((p) =>
  p.items.map((item, i) => ({
    ...item,
    passageId: p.id,
    passage: p.text,
    passageIndex: i,
    passageCount: p.items.length,
  }))
);

/** Every multiple-choice item (single questions + expanded passage questions). */
export const ITEMS = [...L0, ...L1, ...L2, ...L3, ...L4, ...L5, ...expandedPassageItems];

/** Passage sets, kept whole so the engine can serve a reader as one block. */
export const PASSAGE_SETS = PASSAGES.map((p) => ({
  id: p.id,
  lvl: p.lvl,
  itemIds: p.items.map((i) => i.id),
}));

export const LEVEL_COUNT = 6;
