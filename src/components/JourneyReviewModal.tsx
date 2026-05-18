/**
 * Journey confirmation modal — the deliberate "review your trip" step.
 *
 * Shown after the user fills the intent sheet and taps "Generate".
 * - confirm mode: clean summary + brand "Confirm & generate" button.
 * - friction mode: same summary + amber "Yes, generate anyway" button with a
 *   short note explaining the soft warning (chaos, dense pacing, etc).
 * - guidance mode: shows the summary but replaces the generate button with
 *   one-tap fix chips ("Remove 1 city", "Add more days") for inputs that
 *   are not viable (cities > days).
 *
 * Pure presentation — caller wires the actions.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowLeft, Sparkles, MapPin, CalendarDays, Zap, Heart, Wallet, PlaneTakeoff } from 'lucide-react';

export interface JourneySummary {
  destinations: string[];
  startDate: string;
  endDate?: string;
  days: number;
  paceLabel: string;
  paceIcon: string;
  vibeLabel: string;
  vibeIcon: string;
  budgetPerDay: string;
  arrivalTime?: string;
  departureTime?: string;
}

export type ReviewMode = 'confirm' | 'friction' | 'guidance';

export interface GuidanceAction {
  label: string;
  onClick: () => void;
}

interface Props {
  open: boolean;
  mode: ReviewMode;
  journey: JourneySummary;
  /** Friendly one-line note shown above the friction button. */
  frictionNote?: string;
  /** Headline + action chips shown when mode === 'guidance'. */
  guidance?: { headline: string; actions: GuidanceAction[] };
  onEdit: () => void;
  onConfirm: () => void;
}

export default function JourneyReviewModal({
  open, mode, journey, frictionNote, guidance, onEdit, onConfirm,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onEdit}
            className="absolute inset-0 z-[60] bg-ink-900/50"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-[61] bg-white rounded-3xl shadow-card p-5 max-h-[80vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <div className="font-bold text-ink-900 font-display text-base leading-tight">
                    {mode === 'guidance' ? 'Quick check' : 'Review your journey'}
                  </div>
                  <div className="text-[11px] text-ink-500">
                    {mode === 'guidance'
                      ? 'A small tweak first'
                      : mode === 'friction' ? 'Take a look before we plan' : 'Looks good?'}
                  </div>
                </div>
              </div>
              <button onClick={onEdit} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary cards — always shown */}
            <div className="space-y-2.5">
              <SummaryRow icon={<MapPin className="w-3.5 h-3.5 text-brand-600" />} label="Destinations">
                <div className="flex flex-wrap gap-1.5">
                  {journey.destinations.map((d) => (
                    <span key={d} className="text-xs font-semibold text-ink-800 bg-ink-50 rounded-full px-2.5 py-0.5">
                      {d.split(',')[0]}
                    </span>
                  ))}
                </div>
              </SummaryRow>

              <SummaryRow icon={<CalendarDays className="w-3.5 h-3.5 text-brand-600" />} label="Dates">
                <div className="text-xs font-semibold text-ink-800">
                  {fmtDate(journey.startDate)}
                  {journey.endDate && journey.endDate !== journey.startDate ? ` → ${fmtDate(journey.endDate)}` : ''}
                  <span className="ml-2 text-brand-600">· {journey.days} day{journey.days !== 1 ? 's' : ''}</span>
                </div>
              </SummaryRow>

              <div className="grid grid-cols-2 gap-2.5">
                <SummaryRow icon={<Zap className="w-3.5 h-3.5 text-brand-600" />} label="Pace">
                  <div className="text-xs font-semibold text-ink-800">{journey.paceIcon} {journey.paceLabel}</div>
                </SummaryRow>
                <SummaryRow icon={<Heart className="w-3.5 h-3.5 text-brand-600" />} label="Vibe">
                  <div className="text-xs font-semibold text-ink-800">{journey.vibeIcon} {journey.vibeLabel}</div>
                </SummaryRow>
              </div>

              <SummaryRow icon={<Wallet className="w-3.5 h-3.5 text-brand-600" />} label="Budget">
                <div className="text-xs font-semibold text-ink-800">{journey.budgetPerDay} / day</div>
              </SummaryRow>

              {(journey.arrivalTime || journey.departureTime) && (
                <SummaryRow icon={<PlaneTakeoff className="w-3.5 h-3.5 text-brand-600" />} label="Times">
                  <div className="text-xs font-semibold text-ink-800">
                    {journey.arrivalTime && `Arr ${journey.arrivalTime}`}
                    {journey.arrivalTime && journey.departureTime && ' · '}
                    {journey.departureTime && `Dep ${journey.departureTime}`}
                  </div>
                </SummaryRow>
              )}
            </div>

            {/* Action area */}
            {mode === 'guidance' && guidance ? (
              <div className="mt-4 bg-brand-50/60 border border-brand-100 rounded-2xl p-3">
                <div className="text-xs font-semibold text-brand-900 mb-2">{guidance.headline}</div>
                <div className="flex flex-wrap gap-2">
                  {guidance.actions.map((a) => (
                    <button
                      key={a.label}
                      onClick={a.onClick}
                      className="text-xs font-bold text-brand-700 bg-white border border-brand-200 px-3 py-1.5 rounded-full press"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {mode === 'friction' && frictionNote && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    {frictionNote}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="flex-1 h-11 rounded-2xl bg-ink-50 text-ink-700 text-sm font-bold press flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to edit
                  </button>
                  <button
                    onClick={onConfirm}
                    className={
                      mode === 'friction'
                        ? 'flex-[1.4] h-11 rounded-2xl bg-amber-500 text-white text-sm font-bold press shadow-glow'
                        : 'flex-[1.4] h-11 rounded-2xl bg-brand-500 text-white text-sm font-bold press shadow-glow'
                    }
                  >
                    {mode === 'friction' ? 'Yes, generate anyway' : 'Confirm & generate'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SummaryRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-ink-50/50 rounded-2xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wide text-ink-500 font-bold">{label}</span>
      </div>
      {children}
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}
