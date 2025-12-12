import gsap from 'gsap';
import type { AnimationPhase, TerminalStatus } from '../types';
import { animateBarText, animateBarValues } from './utils';

interface ExecutiveTimelineOptions {
  onPhaseChange: (phase: AnimationPhase) => void;
  onStatusChange: (status: TerminalStatus) => void;
  onShowMenu: (show: boolean) => void;
  scrollToModule: (selector: string) => void;
}

export const createExecutiveTimeline = ({
  onPhaseChange,
  onStatusChange,
  onShowMenu,
  scrollToModule,
}: ExecutiveTimelineOptions): gsap.core.Timeline => {
  // Reset all sections to hidden - scope to exec page only
  const sections = [
    '.exec-scroll-content .header-section',
    '.exec-scroll-content .delivery-section',
    '.exec-scroll-content .quality-section',
    '.exec-scroll-content .cicd-section',
    '.exec-scroll-content .jira-section',
    '.exec-scroll-content .community-section',
    '.exec-scroll-content .ai-section',
    '.exec-scroll-content .summary-section'
  ];
  gsap.set(sections, { opacity: 0, visibility: 'hidden', y: 12 });

  // Hide all data cards initially within exec page only
  gsap.set('.exec-scroll-content .header-section .retro-card', { opacity: 0, visibility: 'visible' });
  gsap.set('.exec-scroll-content .delivery-section .retro-card', { opacity: 0, visibility: 'visible' });
  gsap.set('.exec-scroll-content .quality-section .retro-card', { opacity: 0, visibility: 'visible' });
  gsap.set('.exec-scroll-content .cicd-section .retro-card', { opacity: 0, visibility: 'visible' });
  gsap.set('.exec-scroll-content .jira-section .retro-card', { opacity: 0, visibility: 'visible' });
  gsap.set('.exec-scroll-content .community-section .retro-card', { opacity: 0, visibility: 'visible' });
  gsap.set('.exec-scroll-content .ai-section .retro-card', { opacity: 0, visibility: 'visible' });

  gsap.set(
    [
      '.exec-scroll-content .header-command .command-text',
      '.exec-scroll-content .delivery-command .command-text',
      '.exec-scroll-content .quality-command .command-text',
      '.exec-scroll-content .cicd-command .command-text',
      '.exec-scroll-content .jira-command .command-text',
      '.exec-scroll-content .community-command .command-text',
      '.exec-scroll-content .ai-command .command-text',
    ],
    { text: '' }
  );
  gsap.set(
    [
      '.exec-scroll-content .header-command',
      '.exec-scroll-content .delivery-command',
      '.exec-scroll-content .quality-command',
      '.exec-scroll-content .cicd-command',
      '.exec-scroll-content .jira-command',
      '.exec-scroll-content .community-command',
      '.exec-scroll-content .ai-command'
    ],
    { attr: { 'data-active': 'true' } }
  );

  // Initialize progress bars for executive page
  const execBarSelectors = [
    '.exec-scroll-content .build-success-bar',
    '.exec-scroll-content .completion-bar',
    '.exec-scroll-content .ai-adoption-bar',
    '.exec-scroll-content .acceptance-bar'
  ];
  execBarSelectors.forEach((selector) => {
    gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
      const finalBar = el.dataset.bar || el.textContent || '';
      (el as HTMLElement).dataset.finalBar = finalBar;
      (el as HTMLElement).textContent = finalBar ? '░'.repeat(finalBar.length) : '';
    });
  });

  // Hide progress bar values initially
  gsap.set('.exec-scroll-content .stat-row .value', { opacity: 0 });

  // Create timeline for sequential animations
  const tl = gsap.timeline();

  tl.add(() => {
    onShowMenu(false);
    onPhaseChange('git');
    onStatusChange('PROCESSING...');
  });

  // Header Section (includes BasicsSection with 4 cards)
  tl.add(() => scrollToModule('.exec-scroll-content .header-section'))
    .set('.exec-scroll-content .header-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .header-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .header-command .command-text', { text: '> initialize --executive --dashboard', duration: 1.2, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .header-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .header-section .basics-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.3');

  // Delivery Section (primary cards, secondary cards, monthly trends, vendor quadrant)
  tl.add(() => scrollToModule('.exec-scroll-content .delivery-section'), '+=1.2')
    .set('.exec-scroll-content .delivery-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .delivery-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .delivery-command .command-text', { text: '> analyze --velocity --leadtime --vendors', duration: 1.0, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .delivery-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .delivery-section .delivery-primary-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.3')
    .to('.exec-scroll-content .delivery-section .delivery-secondary-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.5')
    .add(() => scrollToModule('.exec-scroll-content .delivery-section .retro-card.is-blue'), '+=2.2')
    .to('.exec-scroll-content .delivery-section .retro-card.is-blue', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.3')
    .add(() => scrollToModule('.exec-scroll-content .delivery-section .retro-card.is-gold'), '+=2.4')
    .to('.exec-scroll-content .delivery-section .retro-card.is-gold', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.3');

  // Quality Section (2 gauge cards in grid-two)
  tl.add(() => scrollToModule('.exec-scroll-content .quality-section'), '+=2.6')
    .set('.exec-scroll-content .quality-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .quality-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .quality-command .command-text', { text: '> analyze --quality --sla --pr-success', duration: 1.0, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .quality-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .quality-section .grid-two .retro-card', { opacity: 1, duration: 0.8, stagger: 0.4, ease: 'power1.out' }, '+=0.3');

  // CI/CD Section (2 cards + 1 build success bar card)
  tl.add(() => scrollToModule('.exec-scroll-content .cicd-section'), '+=2.0')
    .set('.exec-scroll-content .cicd-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .cicd-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .cicd-command .command-text', { text: '> monitor --builds --deployments --pipelines', duration: 1.0, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .cicd-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .cicd-section .cicd-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.3')
    .to('.exec-scroll-content .cicd-section .retro-card.is-gold', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.5');

  // Animate build success bar (starts immediately after card appears)
  animateBarText(tl, '.exec-scroll-content .build-success-bar');
  animateBarValues(tl, '.exec-scroll-content .build-success-bar');

  // Jira Section (2 cards + 1 completion bar card)
  tl.add(() => scrollToModule('.exec-scroll-content .jira-section'), '+=1.2')
    .set('.exec-scroll-content .jira-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .jira-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .jira-command .command-text', { text: '> getdata --jira --tickets --epics', duration: 1.0, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .jira-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .jira-section .jira-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.3')
    .to('.exec-scroll-content .jira-section .retro-card.is-blue', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.5');

  // Animate completion bar
  animateBarText(tl, '.exec-scroll-content .completion-bar');
  animateBarValues(tl, '.exec-scroll-content .completion-bar');

  // Community Section (3 cards)
  tl.add(() => scrollToModule('.exec-scroll-content .community-section'), '+=1.2')
    .set('.exec-scroll-content .community-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .community-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .community-command .command-text', { text: '> getdata --community --collaboration', duration: 1.0, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .community-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .community-section .community-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.3');

  // AI Section (4 cards + 2 bar cards)
  tl.add(() => scrollToModule('.exec-scroll-content .ai-section'), '+=1.2')
    .set('.exec-scroll-content .ai-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .ai-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.exec-scroll-content .ai-command .command-text', { text: '> analyze --ai --productivity --impact', duration: 1.0, ease: 'none' }, '+=0.2')
    .add(() => { gsap.set('.exec-scroll-content .ai-command', { attr: { 'data-active': 'false' } }); }, '+=0.2')
    .to('.exec-scroll-content .ai-section .ai-cards .retro-card', { opacity: 1, duration: 0.8, stagger: 0.35, ease: 'power1.out' }, '+=0.3')
    .to('.exec-scroll-content .ai-section .retro-card.is-purple', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.5');

  // Animate AI adoption bar
  animateBarText(tl, '.exec-scroll-content .ai-adoption-bar');
  animateBarValues(tl, '.exec-scroll-content .ai-adoption-bar');

  tl.to('.exec-scroll-content .ai-section .retro-card.is-gold', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.5');

  // Animate acceptance bar
  animateBarText(tl, '.exec-scroll-content .acceptance-bar');
  animateBarValues(tl, '.exec-scroll-content .acceptance-bar');

  // Summary Section
  tl.add(() => scrollToModule('.exec-scroll-content .summary-section'), '+=1')
    .set('.exec-scroll-content .summary-section', { visibility: 'visible' }, '+=0.2')
    .to('.exec-scroll-content .summary-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .add(() => {
      onPhaseChange('summary');
      onStatusChange('READY');
      onShowMenu(true);
    });

  return tl;
};
