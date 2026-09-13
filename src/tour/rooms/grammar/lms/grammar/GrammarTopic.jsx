/**
 * GrammarTopic — TOUR PORT of the thin composer inside fluentia-lms
 * src/pages/student/curriculum/tabs/GrammarTab.jsx (origin/main 3396e97e).
 *
 * GrammarTab fetches `curriculum_grammar` + its exercises for the unit and renders one
 * GrammarTopic per topic. Here the topic arrives as a snapshot prop, and the composition
 * is the platform's, in the platform's order:
 *   GrammarPageShell → GrammarHeader → LessonCard → DeepPanel → ExceptionsCard
 *   → CommonMistakesCard → ExerciseSection
 * Omitted: GrammarMapPanel (custom tracks only), and DialectExplanationCard — its Najdi
 * audio is a cloned voice that is never used outside the product. ExceptionsCard is
 * skipped because this lesson has none (`exceptions: null`).
 */
import { useState } from 'react'
import GrammarPageShell from './GrammarPageShell'
import GrammarHeader from './GrammarHeader'
import LessonCard from './LessonCard'
import DeepPanel from './DeepPanel'
import CommonMistakesCard from './CommonMistakesCard'
import ExerciseSection from './ExerciseSection'
import { useGenderize } from '../i18n/gender'

export default function GrammarTopic({ topic }) {
  const gz = useGenderize()
  const [bestScore, setBestScore] = useState(null)
  const [attemptNumber, setAttemptNumber] = useState(1)

  const sections = topic.explanation_content?.sections || []

  // «تلميح» — the paradigm's golden rule from the depth layer, falling back to the lesson's
  // formula (precomputed into the snapshot by build-snapshots.mjs, same derivation).
  const hintAr = topic.hintAr ? gz(topic.hintAr) : null

  // Split sections: common_mistakes go to their own card
  const lessonSections = sections.filter(s => s.type !== 'common_mistakes')
  const mistakesSection = sections.find(s => s.type === 'common_mistakes')

  // Build a rule snippet from explanation sections (the platform sends it to the AI tutor;
  // VerdictPanel also shows it when an item has no Arabic explanation)
  const ruleSnippet = sections
    .filter(s => s.type === 'explanation')
    .map(s => s.content_en || '')
    .join(' ')
    .slice(0, 500)

  return (
    <GrammarPageShell>
      <GrammarHeader
        topic={topic}
        attemptNumber={attemptNumber}
        bestScore={bestScore}
      />

      {/* Lesson content */}
      <LessonCard sections={lessonSections} />

      {/* Tier 2 — the depth layer, collapsed. Sits directly under the
          explanation so "I need more" is one tap from where the doubt starts. */}
      <DeepPanel content={topic.deep_content} />

      {/* Common mistakes */}
      <CommonMistakesCard items={mistakesSection?.items} />

      {/* Exercises — always inline */}
      <ExerciseSection
        exercises={topic.exercises}
        ruleSnippet={ruleSnippet}
        hintAr={hintAr}
        onAttemptUpdate={(score, attempt, best) => {
          if (best != null) setBestScore(best)
          if (attempt != null) setAttemptNumber(attempt)
        }}
      />
    </GrammarPageShell>
  )
}
