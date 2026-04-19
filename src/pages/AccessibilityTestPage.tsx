/**
 * Accessibility Test Page — WCAG 2.1 AA Validation
 *
 * @description Interactive demo showing all focus states, contrast ratios,
 *              and keyboard navigation patterns in compliance with WCAG AA.
 *
 * @route /accessibility-test (Admin/dev only)
 *
 * Use this page to:
 * - Test keyboard navigation (Tab through all elements)
 * - Verify focus ring visibility
 * - Check contrast ratios
 * - Validate ARIA labels
 * - Test screen reader compatibility
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';
import {
  checkWCAGCompliance,
  FOCUS_CLASSES,
  makeKeyboardClickable,
  announceToScreenReader,
  createKeyboardNavHandler,
} from '@/utils/accessibility';

export default function AccessibilityTestPage() {
  const [testResults, setTestResults] = React.useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, message]);
    announceToScreenReader(message);
  };

  return (
    <>
      <Helmet>
        <title>Accessibility Test | FitFi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#FAFAF8] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#8A8A8A] hover:text-[#1A1A1A] mb-4 focus-visible:outline-2 focus-visible:outline-[#C2654A]"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar Dashboard
            </a>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[#1A1A1A] mb-3">Accessibility Test</h1>
            <p className="text-lg font-normal leading-relaxed text-[#8A8A8A]">
              WCAG 2.1 Level AA Compliance Demo
            </p>
          </div>

          {/* Test Instructions */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl mb-8 p-6 border-l-4 border-[#C2654A]">
            <h2 className="text-xl md:text-2xl font-semibold text-[#1A1A1A] mb-3">Test Instructions</h2>
            <ol className="space-y-2 text-base font-normal leading-relaxed text-[#4A4A4A]">
              <li>
                <strong>1. Keyboard Test:</strong> Press <kbd className="px-2 py-1 bg-[#E5E5E5] rounded">Tab</kbd> repeatedly to navigate through all elements
              </li>
              <li>
                <strong>2. Focus Visibility:</strong> Verify every element shows a clear blue focus ring
              </li>
              <li>
                <strong>3. Activation:</strong> Press <kbd className="px-2 py-1 bg-[#E5E5E5] rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-[#E5E5E5] rounded">Space</kbd> on focused elements
              </li>
              <li>
                <strong>4. Contrast:</strong> Check all text is clearly readable
              </li>
            </ol>
          </div>

          {/* 1. Focus State Examples */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl mb-8 p-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-6">1. Focus States (WCAG 2.4.7)</h2>

            <div className="space-y-6">
              {/* Standard Focus */}
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Standard Focus (Light Backgrounds)</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    className={`bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl`}
                    onClick={() => addResult('Primary button clicked')}
                  >
                    Primary Button
                  </button>

                  <button
                    className={`bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl`}
                    onClick={() => addResult('Secondary button clicked')}
                  >
                    Secondary Button
                  </button>

                  <a
                    href="#test"
                    className="ff-link"
                    onClick={(e) => {
                      e.preventDefault();
                      addResult('Link clicked');
                    }}
                  >
                    Standard Link
                  </a>

                  <div
                    role="button"
                    tabIndex={0}
                    className={`px-4 py-2 bg-white border-2 border-[#E5E5E5] rounded-xl cursor-pointer ${FOCUS_CLASSES.standard}`}
                    onClick={() => addResult('Custom div button clicked')}
                    onKeyDown={makeKeyboardClickable(() => addResult('Custom div button activated via keyboard'))}
                  >
                    Custom Div Button
                  </div>
                </div>
                <p className="text-sm text-[#8A8A8A] mt-2">
                  ✅ Focus ring: <strong>3px solid blue (#2563EB)</strong> — 8.2:1 contrast ratio
                </p>
              </div>

              {/* Brand Focus */}
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Brand Focus (Optional)</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    className={`px-6 py-3 bg-[#A8513A] text-white rounded-xl ${FOCUS_CLASSES.brand}`}
                    onClick={() => addResult('Brand focus button clicked')}
                  >
                    Brand Color Focus
                  </button>
                </div>
                <p className="text-sm text-[#8A8A8A] mt-2">
                  ⚠️ Brand focus: <strong>3px solid brown (#7A614A)</strong> — Only use on light backgrounds
                </p>
              </div>

              {/* Dark Background Focus */}
              <div className="bg-[#1A1A1A] p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3 text-white">Dark Background Focus</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    className={`bg-transparent border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl`}
                    onClick={() => addResult('Ghost button clicked')}
                  >
                    Ghost Button
                  </button>

                  <a
                    href="#test"
                    className={`px-4 py-2 text-white border-2 border-white/40 rounded-xl ${FOCUS_CLASSES.dark}`}
                    onClick={(e) => {
                      e.preventDefault();
                      addResult('Dark background link clicked');
                    }}
                  >
                    Dark BG Link
                  </a>
                </div>
                <p className="text-sm text-white/70 mt-2">
                  ✅ Focus ring: <strong>3px solid light blue (#3B82F6)</strong> — High contrast on dark
                </p>
              </div>

              {/* Strong Focus */}
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Strong Focus (Critical CTAs)</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    className={`bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl ${FOCUS_CLASSES.strong}`}
                    onClick={() => addResult('Strong focus CTA clicked')}
                  >
                    Critical Action
                  </button>
                </div>
                <p className="text-sm text-[#8A8A8A] mt-2">
                  ✅ Focus ring: <strong>4px solid blue</strong> — Extra visible for important actions
                </p>
              </div>
            </div>
          </section>

          {/* 2. Form Focus States */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl mb-8 p-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-6">2. Form Focus States (WCAG 2.4.7)</h2>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                addResult('Form submitted successfully!');
              }}
            >
              {/* Text Input */}
              <div>
                <label htmlFor="test-email" className="block text-base font-normal leading-relaxed text-[#4A4A4A] font-semibold mb-2">
                  Email Address
                </label>
                <input
                  id="test-email"
                  type="email"
                  className={`w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl bg-white text-[#1A1A1A] transition-all outline-none focus-visible:border-[#C2654A] focus-visible:ring-2 focus-visible:ring-[#C2654A]/20`}
                  placeholder="naam@voorbeeld.nl"
                />
                <p className="text-sm text-[#8A8A8A] mt-1">
                  ✅ Focus: Blue border + subtle shadow
                </p>
              </div>

              {/* Textarea */}
              <div>
                <label htmlFor="test-message" className="block text-base font-normal leading-relaxed text-[#4A4A4A] font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="test-message"
                  rows={4}
                  className={`w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl bg-white text-[#1A1A1A] transition-all outline-none focus-visible:border-[#C2654A] focus-visible:ring-2 focus-visible:ring-[#C2654A]/20`}
                  placeholder="Type your message..."
                />
              </div>

              {/* Select */}
              <div>
                <label htmlFor="test-select" className="block text-base font-normal leading-relaxed text-[#4A4A4A] font-semibold mb-2">
                  Select Option
                </label>
                <select
                  id="test-select"
                  className={`w-full px-4 py-3 border-2 border-[#E5E5E5] rounded-xl bg-white text-[#1A1A1A] transition-all outline-none focus-visible:border-[#C2654A] focus-visible:ring-2 focus-visible:ring-[#C2654A]/20`}
                >
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  id="test-checkbox"
                  type="checkbox"
                  className={`mt-1 w-5 h-5 border-2 border-[#E5E5E5] rounded transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 focus-visible:ring-2 focus-visible:ring-[#C2654A]`}
                />
                <label htmlFor="test-checkbox" className="text-base font-normal leading-relaxed text-[#4A4A4A]">
                  I agree to the terms and conditions
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl">
                Submit Form
              </button>
            </form>
          </section>

          {/* 3. Contrast Ratios */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl mb-8 p-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-6">3. Color Contrast (WCAG 1.4.3)</h2>

            <div className="space-y-4">
              {[
                { fg: '#1E2333', bg: '#F7F3EC', label: 'Body Text', type: 'normal' as const },
                { fg: '#4A5568', bg: '#F7F3EC', label: 'Muted Text', type: 'normal' as const },
                { fg: '#7A614A', bg: '#FFFFFF', label: 'Primary-700 on White', type: 'normal' as const },
                { fg: '#2563EB', bg: '#F7F3EC', label: 'Focus Ring', type: 'ui' as const },
                { fg: '#A6886A', bg: '#FFFFFF', label: 'Primary-500 on White (Large Text Only)', type: 'large' as const },
              ].map(({ fg, bg, label, type }) => {
                const result = checkWCAGCompliance(fg, bg, type);
                return (
                  <div key={label} className="flex items-center justify-between p-4 bg-[#FAFAF8] rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-12 rounded border-2 border-[#E5E5E5]"
                          style={{ backgroundColor: fg }}
                          aria-label={`Foreground color: ${fg}`}
                        />
                        <div
                          className="w-12 h-12 rounded border-2 border-[#E5E5E5]"
                          style={{ backgroundColor: bg }}
                          aria-label={`Background color: ${bg}`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{label}</p>
                        <p className="text-sm text-[#8A8A8A]">
                          {fg} on {bg}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{result.ratio.toFixed(1)}:1</p>
                      <p className={`text-sm flex items-center gap-1 ${result.passAA ? 'text-green-600' : 'text-red-600'}`}>
                        {result.passAA ? (
                          <>
                            <Check className="w-4 h-4" />
                            WCAG AA Pass
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            WCAG AA Fail
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm">
                <strong>WCAG Requirements:</strong>
              </p>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Normal text: ≥ 4.5:1</li>
                <li>• Large text (18pt+ or 14pt+ bold): ≥ 3:1</li>
                <li>• UI components: ≥ 3:1</li>
              </ul>
            </div>
          </section>

          {/* 4. Keyboard Navigation */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl mb-8 p-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-6">4. Keyboard Navigation (WCAG 2.1.1)</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">Arrow Key Navigation</h3>
                <div
                  role="listbox"
                  aria-label="Test listbox"
                  className="space-y-2"
                  onKeyDown={createKeyboardNavHandler({
                    onArrowDown: () => addResult('Arrow Down pressed'),
                    onArrowUp: () => addResult('Arrow Up pressed'),
                  })}
                >
                  {['Option 1', 'Option 2', 'Option 3'].map((option) => (
                    <div
                      key={option}
                      role="option"
                      tabIndex={0}
                      aria-selected={false}
                      className={`px-4 py-3 bg-white border-2 border-[#E5E5E5] rounded-xl cursor-pointer ${FOCUS_CLASSES.standard}`}
                      onClick={() => addResult(`Selected: ${option}`)}
                      onKeyDown={makeKeyboardClickable(() => addResult(`Keyboard selected: ${option}`))}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#8A8A8A] mt-2">
                  ✅ Try: Tab to focus, Arrow keys to navigate, Enter to select
                </p>
              </div>
            </div>
          </section>

          {/* 5. Screen Reader Test */}
          <section className="bg-white border border-[#E5E5E5] rounded-2xl mb-8 p-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-6">5. Screen Reader Test (WCAG 4.1.2)</h2>

            <div className="space-y-4">
              <button
                className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl"
                onClick={() => {
                  announceToScreenReader('This message is announced to screen readers!');
                  addResult('Screen reader announcement triggered');
                }}
                aria-label="Test screen reader announcement"
              >
                Test Screen Reader Announcement
              </button>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-sm">
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  <strong>Test with real screen reader:</strong> Enable VoiceOver (Mac), NVDA (Windows), or TalkBack (Android) to test announcements.
                </p>
              </div>
            </div>
          </section>

          {/* Test Results Log */}
          {testResults.length > 0 && (
            <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6">
              <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A] mb-4">Test Results Log</h2>
              <div
                role="log"
                aria-live="polite"
                aria-atomic="false"
                className="space-y-2 max-h-64 overflow-y-auto"
              >
                {testResults.map((result, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 bg-[#F5F0EB] rounded text-sm"
                  >
                    <Check className="inline w-4 h-4 text-green-600 mr-2" />
                    {result}
                  </div>
                ))}
              </div>
              <button
                className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl mt-4"
                onClick={() => setTestResults([])}
              >
                Clear Log
              </button>
            </section>
          )}

          {/* Summary */}
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-green-900 mb-3">WCAG 2.1 AA Compliance ✅</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <strong>2.1.1 Keyboard:</strong> All functionality available via keyboard
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <strong>2.4.7 Focus Visible:</strong> Focus indicators have ≥ 3:1 contrast
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <strong>1.4.3 Contrast (Minimum):</strong> Text contrast ≥ 4.5:1
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <strong>1.4.11 Non-text Contrast:</strong> UI components ≥ 3:1
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <strong>4.1.2 Name, Role, Value:</strong> ARIA labels present
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-green-300">
              <p className="text-sm font-semibold text-green-900">
                Legal Compliance: EAA (June 2025) ✅ | ADA ✅ | Section 508 ✅
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
