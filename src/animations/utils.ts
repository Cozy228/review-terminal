import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

// Ensure TextPlugin is registered, though it's likely registered in App.tsx
// It's safe to register multiple times
gsap.registerPlugin(TextPlugin);

/**
 * Animates the text content of bar elements (e.g. progress bars)
 * using a typewriter/scramble effect.
 */
export const animateBarText = (tl: gsap.core.Timeline, selector: string) => {
  const targets = gsap.utils.toArray<HTMLElement>(selector);
  if (!targets.length) return;

  tl.to(targets, {
    duration: 0.9,
    ease: 'steps(18)',
    text: {
      value: ((_index: number, target: Element) =>
        (target as HTMLElement).dataset.finalBar || (target as HTMLElement).dataset.bar || '') as unknown as string,
    },
    stagger: 0.08,
  });
};

/**
 * Animates the opacity of the value labels associated with the bars.
 */
export const animateBarValues = (tl: gsap.core.Timeline, barSelector: string) => {
  const barTargets = gsap.utils.toArray<HTMLElement>(barSelector);
  if (!barTargets.length) return;

  // Get the parent .stat-row elements and find their .value children
  const valueTargets = barTargets.map(bar => {
    const statRow = bar.closest('.stat-row');
    return statRow?.querySelector('.value');
  }).filter(Boolean);

  tl.to(valueTargets, {
    opacity: 1,
    duration: 0.2,
    stagger: 0.08, // Same stagger as bars
    ease: 'power2.out'
  }, '<1.2'); // Start 1.2s after bars start = 0.3s delay after 0.9s bar completes
};

/**
 * Resets the state of retro modules (hiding elements, resetting text).
 * Used at the beginning of the data timeline.
 */
export const resetRetroModules = () => {
  const modules = [
    '.player-section',
    '.git-section',
    '.skills-section',
    '.delivery-section',
    '.cicd-section',
    '.copilot-section',
    '.learning-section',
    '.community-section',
    '.summary-section'
  ];
  gsap.set(modules, { opacity: 0, visibility: 'hidden', y: 12 });
  gsap.set(
    [
      '.player-command .command-text',
      '.git-command .command-text',
      '.skills-command .command-text',
      '.delivery-command .command-text',
      '.cicd-command .command-text',
      '.copilot-command .command-text',
      '.learning-command .command-text',
      '.community-command .command-text',
      '.summary-command .command-text',
    ],
    { text: '' }
  );
  gsap.set(
    [
      '.player-command',
      '.git-command',
      '.skills-command',
      '.delivery-command',
      '.cicd-command',
      '.copilot-command',
      '.learning-command',
      '.community-command',
      '.summary-command'
    ],
    { attr: { 'data-active': 'true' } }
  );
  gsap.set(
    [
      '.git-monthly-card',
      '.git-narrative',
      '.achievement-card',
      '.summary-section .retro-card',
      '.summary-menu',
      '.delivery-section .retro-card.is-red',
      '.cicd-section .retro-card',
      '.copilot-section .retro-card',
      '.learning-section .retro-card',
      '.community-section .retro-card'
    ],
    { opacity: 0, visibility: 'visible' }
  );

  // Hide individual highlights initially
  gsap.set('.highlight-text', { opacity: 0, y: 8 });

  // Hide contribution blocks initially so they can be revealed with stagger
  gsap.set('.contrib-block', { opacity: 0, scale: 0.8, y: 10 });
  gsap.set('.contrib-label', { opacity: 0 });

  // Hide all bar values initially - they should appear after bars animate
  gsap.set('.stat-row .value', { opacity: 0 });

  // Hide growth percentage text initially - should appear after score animates
  gsap.set('.summary-section .retro-card.is-gold .retro-card-note', { opacity: 0 });

  const barSelectors = [
    '.language-bar',
    '.framework-bar',
    '.level-bar',
    '.project-bar',
    '.build-success-bar',
    '.copilot-acceptance-bar'
  ];
  barSelectors.forEach((selector) => {
    gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
      const finalBar = el.dataset.bar || el.textContent || '';
      (el as HTMLElement).dataset.finalBar = finalBar;
      (el as HTMLElement).textContent = finalBar ? '░'.repeat(finalBar.length) : '';
    });
  });
};


