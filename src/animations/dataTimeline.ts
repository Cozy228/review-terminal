import gsap from 'gsap';
import type { AnimationPhase, TerminalStatus } from '../types';
import { animateBarText, animateBarValues, resetRetroModules } from './utils';

interface DataTimelineOptions {
  onPhaseChange: (phase: AnimationPhase) => void;
  onStatusChange: (status: TerminalStatus) => void;
  onShowMenu: (show: boolean) => void;
  scrollToModule: (selector: string) => void;
  setupDataScroll: () => void;
  idlePageRef: React.RefObject<HTMLDivElement | null>;
  dataPageRef: React.RefObject<HTMLDivElement | null>;
  isReplay: boolean;
  setUserScrolling: (isScrolling: boolean) => void;
}

export const createDataTimeline = ({
  onPhaseChange,
  onStatusChange,
  onShowMenu,
  scrollToModule,
  setupDataScroll,
  idlePageRef,
  dataPageRef,
  isReplay,
  setUserScrolling
}: DataTimelineOptions): gsap.core.Timeline => {
  const tl = gsap.timeline();

  // Only transition from idle page on first load, not on replay
  if (!isReplay) {
    if (idlePageRef.current) {
      tl.to(idlePageRef.current, { opacity: 0, duration: 0.3 })
        .set(idlePageRef.current, { display: 'none' });
    }

    if (dataPageRef.current) {
      gsap.set(dataPageRef.current, { display: 'block', opacity: 0 });
      dataPageRef.current.scrollTop = 0;
      setUserScrolling(false);
      setupDataScroll();
      tl.to(dataPageRef.current, { opacity: 1, duration: 0.3 });
    }
  } else {
    // Replay: page already visible, just reset scroll
    if (dataPageRef.current) {
      dataPageRef.current.scrollTop = 0;
      setUserScrolling(false);
    }
    setupDataScroll();
  }

  tl.add(() => {
    setUserScrolling(false);
    resetRetroModules();
  });

  tl
    .add(() => scrollToModule('.player-section'))
    .set('.player-section', { visibility: 'visible' }, '+=0.2')
    .to('.player-section', { opacity: 1, y: 0, duration: 1, ease: 'steps(10)' })
    .to('.player-command .command-text', { text: '> initialize --player --status', duration: 1.2, ease: 'none' }, '<')
    .add(() => { gsap.set('.player-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.player-profile-card', { opacity: 0, y: 10, duration: 0.8, ease: 'power1.out' }, '+=0.3');

  tl
    .add(() => onPhaseChange('git'), '+=2')
    .add(() => scrollToModule('.git-section'))
    .set('.git-section', { visibility: 'visible' }, '+=0.2')
    .to('.git-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.git-command .command-text', { text: '> getdata --github --commits --prs', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.git-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.git-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.4, ease: 'power1.out' }, '+=0.3')
    .add(() => scrollToModule('.git-cards .retro-card:nth-child(6)'), '-=2.0')
    .add(() => scrollToModule('.git-monthly-card'), '+=1.5')
    .from('.git-monthly-card', { opacity: 0, y: 10, duration: 0.8, ease: 'power1.out' }, '+=0.2')
    .to('.contrib-block', {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'back.out(1.7)'
    }, '+=0.3')
    .to('.contrib-label', { opacity: 1, duration: 0.3, stagger: 0.15 }, '-=1.5')
    .from('.git-narrative', { opacity: 0, duration: 0.6 }, '+=0.2')
    .add(() => scrollToModule('.git-collaborators-card'), '+=0.5')
    .from('.git-collaborators-card', { opacity: 0, y: 10, duration: 0.8, ease: 'power1.out' }, '+=0.2')
    .from('.collab-story', { opacity: 0, x: -10, duration: 0.6, stagger: 0.3, ease: 'power1.out' }, '+=0.2');

  tl
    .add(() => onPhaseChange('stack'), '+=2')
    .add(() => scrollToModule('.skills-section'))
    .set('.skills-section', { visibility: 'visible' }, '+=0.2')
    .to('.skills-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.skills-command .command-text', { text: '> analyze --languages --frameworks', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.skills-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.skills-section .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3');
  animateBarText(tl, '.language-bar');
  animateBarValues(tl, '.language-bar');
  tl.add(() => scrollToModule('.language-bars'), '+=0.3');
  animateBarText(tl, '.framework-bar');
  animateBarValues(tl, '.framework-bar');
  tl.add(() => scrollToModule('.framework-bars'), '+=0.3');
  animateBarText(tl, '.level-bar');
  animateBarValues(tl, '.level-bar');
  tl.add(() => scrollToModule('.leveling-bars'), '+=0.3');

  tl
    .add(() => onPhaseChange('flow'), '+=2')
    .add(() => scrollToModule('.delivery-section'))
    .set('.delivery-section', { visibility: 'visible' }, '+=0.2')
    .to('.delivery-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.delivery-command .command-text', { text: '> getdata --jira --stories --bugs', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.delivery-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.delivery-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
    .to('.delivery-section .retro-card.is-red', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.3');
  animateBarText(tl, '.project-bar');
  animateBarValues(tl, '.project-bar');
  tl.add(() => scrollToModule('.delivery-projects'), '+=0.3');

  // CI/CD Section
  tl
    .add(() => onPhaseChange('cicd'), '+=2')
    .add(() => scrollToModule('.cicd-section'))
    .set('.cicd-section', { visibility: 'visible' }, '+=0.2')
    .to('.cicd-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.cicd-command .command-text', { text: '> monitor --builds --deployments --pipelines', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.cicd-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.cicd-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
    .to('.cicd-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.3');
  animateBarText(tl, '.build-success-bar');
  animateBarValues(tl, '.build-success-bar');
  tl.add(() => scrollToModule('.cicd-section .retro-card'), '+=0.3');

  // Copilot Section
  tl
    .add(() => onPhaseChange('copilot'), '+=2')
    .add(() => scrollToModule('.copilot-section'))
    .set('.copilot-section', { visibility: 'visible' }, '+=0.2')
    .to('.copilot-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.copilot-command .command-text', { text: '> analyze --copilot --productivity', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.copilot-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.copilot-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
    .add(() => scrollToModule('.copilot-section .retro-card'), '+=0.3')
    .to('.copilot-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.2');
  animateBarText(tl, '.copilot-acceptance-bar');
  animateBarValues(tl, '.copilot-acceptance-bar');

  // Learning Section
  tl
    .add(() => onPhaseChange('learning'), '+=2')
    .add(() => scrollToModule('.learning-section'))
    .set('.learning-section', { visibility: 'visible' }, '+=0.2')
    .to('.learning-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.learning-command .command-text', { text: '> getdata --courses --certifications --growth', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.learning-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.learning-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
    .add(() => scrollToModule('.learning-section .retro-card'), '+=0.5')
    .to('.learning-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.2');

  // Community Section
  tl
    .add(() => onPhaseChange('community'), '+=2')
    .add(() => scrollToModule('.community-section'))
    .set('.community-section', { visibility: 'visible' }, '+=0.2')
    .to('.community-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.community-command .command-text', { text: '> getdata --bravos --events --contributions', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.community-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.community-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
    .add(() => scrollToModule('.community-section .retro-card'), '+=0.8')
    .to('.community-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.5');

  tl
    .add(() => onPhaseChange('summary'), '+=2')
    .add(() => scrollToModule('.summary-section'))
    .set('.summary-section', { visibility: 'visible' }, '+=0.2')
    .to('.summary-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
    .to('.summary-command .command-text', { text: '> compute --score --achievements', duration: 1.5, ease: 'none' })
    .add(() => { gsap.set('.summary-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
    .from('.summary-section .retro-card.is-gold', { opacity: 0, y: 12, duration: 0.8, ease: 'power1.out' }, '+=0.3')
    .from('.summary-score', { textContent: 0, duration: 1.5, snap: { textContent: 1 }, ease: 'power1.inOut' }, '-=0.3')
    // Growth percentage appears after score animation finishes
    .to('.summary-section .retro-card.is-gold .retro-card-note', { opacity: 1, duration: 0.6, ease: 'power1.out' }, '+=0.2')
    .from('.summary-section .retro-card.is-blue', { opacity: 0, y: 12, duration: 0.8, ease: 'power1.out' }, '+=0.3')
    // Scroll to highlights before they appear
    .add(() => scrollToModule('.summary-section .retro-card.is-blue'), '+=0.3')
    // Animate highlights one by one with reading time
    .to('.highlight-text', { opacity: 1, y: 0, duration: 0.6, stagger: 1.5, ease: 'power1.out' }, '+=0.5')
    .add(() => scrollToModule('.achievement-card'), '+=0.8')
    // Longer delay before achievement cards appear, with longer stagger between each badge
    .to('.achievement-card', { opacity: 1, y: 0, duration: 0.8, stagger: 0.4, ease: 'power1.out' }, '+=1.0')
    .add(() => scrollToModule('.summary-menu'), '+=0.5')
    .set('.summary-menu', { visibility: 'visible' })
    .to('.summary-menu', { opacity: 1, y: 0, duration: 0.8, ease: 'power1.out' })
    .add(() => onShowMenu(true))
    .add(() => onStatusChange('COMPLETE'), '+=0.2');

  return tl;
};

