import clsx from 'clsx';
import { forwardRef, useMemo } from 'react';
import { DataCardGroup, TerminalCommand, TypewriterText, ContributionGrid } from '../components/retro';
import { GitAdapter } from '../adapters/GitAdapter';
import { StackAdapter } from '../adapters/StackAdapter';
import { FlowAdapter } from '../adapters/FlowAdapter';
import { CICDAdapter } from '../adapters/CICDAdapter';
import { CopilotAdapter } from '../adapters/CopilotAdapter';
import { LearningAdapter } from '../adapters/LearningAdapter';
import { CommunityAdapter } from '../adapters/CommunityAdapter';
import type { ReviewData } from '../types';

interface DataPageProps {
  reviewData: ReviewData;
  displayUser: string;
  showMenu: boolean;
  onReplay: () => void;
}

interface Achievement {
  name: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
  icon: string;
  note: string;
}

const parseHighlight = (text: string) => {
  // Match numbers (including decimals and percentages)
  const parts = text.split(/(\d+\.?\d*%?)/g);
  return parts.map((part, i) => {
    if (/\d/.test(part)) {
      return <span key={i} className="highlight-number">{part}</span>;
    }
    return part;
  });
};

export const DataPage = forwardRef<HTMLDivElement, DataPageProps>(
  ({ reviewData, displayUser, showMenu, onReplay }, ref) => {
    const { user, git, techStack, workflow, cicd, jira, copilot, learning, community, summary } = reviewData;

    // Git data
    const gitCards = useMemo(() => GitAdapter.toStatCards(git), [git]);
    const contributionData = useMemo(() => GitAdapter.toContributionGridData(git), [git]);
    const gitNarrative = useMemo(() => GitAdapter.toNarrative(git), [git]);
    const collaboratorsList = useMemo(() => GitAdapter.toCollaboratorList(git), [git]);

    // Tech stack data
    const languageBars = useMemo(() => StackAdapter.toLanguageBars(techStack), [techStack]);
    const frameworkBars = useMemo(() => StackAdapter.toFrameworkUsage(techStack), [techStack]);
    const levelingUp = useMemo(() => StackAdapter.toLevelingUp(techStack, learning), [techStack, learning]);

    // Workflow/Jira data (merged)
    const deliveryStats = useMemo(() => FlowAdapter.toDeliveryStats(workflow, jira), [workflow, jira]);
    const deliveryProjects = useMemo(() => FlowAdapter.toProjectProgress(workflow, jira), [workflow, jira]);

    // CI/CD data
    const cicdCards = useMemo(() => CICDAdapter.toStatCards(cicd), [cicd]);
    const cicdNarrative = useMemo(() => CICDAdapter.toNarrative(cicd), [cicd]);
    const buildSuccessBar = useMemo(() => CICDAdapter.toBuildSuccessBar(cicd), [cicd]);

    // Copilot data
    const copilotCards = useMemo(() => CopilotAdapter.toStatCards(copilot), [copilot]);
    const copilotNarrative = useMemo(() => CopilotAdapter.toNarrative(copilot), [copilot]);
    const copilotAcceptanceBar = useMemo(() => CopilotAdapter.toAcceptanceBar(copilot), [copilot]);

    // Learning data
    const learningCards = useMemo(() => LearningAdapter.toStatCards(learning), [learning]);
    const learningNarrative = useMemo(() => LearningAdapter.toNarrative(learning), [learning]);

    // Community data
    const communityCards = useMemo(() => CommunityAdapter.toStatCards(community), [community]);
    const communityActivities = useMemo(() => CommunityAdapter.toActivityList(community), [community]);
    const communityNarrative = useMemo(() => CommunityAdapter.toNarrative(community), [community]);

    const tenure = useMemo(() => {
      const joinDate = new Date(user.joinDate);
      const currentDate = new Date();

      // Calculate difference in months
      const yearsDiff = currentDate.getFullYear() - joinDate.getFullYear();
      const monthsDiff = currentDate.getMonth() - joinDate.getMonth();
      const totalMonths = yearsDiff * 12 + monthsDiff;

      // Calculate years for display (rounded down)
      const years = Math.floor(totalMonths / 12);

      return { years, months: totalMonths };
    }, [user.joinDate]);

    const playerLevel = useMemo(() => {
      // Calculate level based on job title and tenure
      const jobBaseLevels: Record<string, number> = {
        'Intern': 5,
        'Junior Engineer': 15,
        'Engineer': 30,
        'Senior Engineer': 45,
        'Staff Engineer': 65,
        'Principal Engineer': 80,
        'Distinguished Engineer': 92,
      };

      const baseLevel = jobBaseLevels[user.jobTitle] || 30;
      // Use months for more precise calculation: ~0.33 levels per month, max +25
      const tenureBonus = Math.min(Math.floor(tenure.months / 3), 25);

      const level = Math.min(99, baseLevel + tenureBonus);

      return { level };
    }, [user.jobTitle, tenure]);

    // Use real summary badges, sorted by rarity level
    const achievements: Achievement[] = useMemo(() => {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return summary.badges
        .map(badge => ({
          name: badge.name.toUpperCase(),
          rarity: badge.rarity,
          icon: badge.icon,
          note: badge.description
        }))
        .sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    }, [summary.badges]);

    const rarityClass = (rarity: Achievement['rarity']) => {
      switch (rarity) {
        case 'legendary':
          return 'legendary';
        case 'epic':
          return 'epic';
        case 'rare':
          return 'rare';
        default:
          return 'common';
      }
    };

    return (
      <div
        ref={ref}
        className="fixed inset-0 overflow-hidden data-scroll-wrapper"
        style={{ display: 'none' }}
      >
        <div className="data-scroll-content retro-shell scanline" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          {/* Player Status */}
          <section className="retro-section player-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">PLAYER STATUS</div>
            <TerminalCommand className="player-command mb-4" text="> initialize --player --status" />
            <div className="retro-card is-blue player-profile-card">
              <div className="player-info">
                {user.avatar && (
                  <div className="avatar-wrapper">
                    <img src={user.avatar} alt={displayUser} className="retro-avatar player-avatar" />
                  </div>
                )}
                <div className="player-details">
                  <div className="player-header">
                    <div className="retro-card-note player-username">@{displayUser}</div>
                    <div className="player-level-badge">LV.{playerLevel.level.toString().padStart(2, '0')}</div>
                  </div>
                  <div className="retro-card-note">Department: {user.department}</div>
                  <div className="retro-card-note">Location: {user.location || 'Earth'}</div>
                  <div className="retro-card-note">Tenure: {tenure.years} years</div>
                </div>
              </div>
            </div>
          </section>

          {/* Git Module */}
          <section className="retro-section git-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">GIT BATTLE LOG</div>
            <TerminalCommand className="git-command mb-4" text="> getdata --github --commits --prs" />
            <DataCardGroup items={gitCards} className="git-cards mb-4" />
            <div className="retro-card is-blue git-monthly-card mb-4">
              <div className="retro-card-title">2025 CONTRIBUTION ACTIVITY</div>
              <div className="contribution-wrapper">
                <ContributionGrid data={contributionData} />
              </div>
              <TypewriterText className="retro-card-note git-narrative" initialText={gitNarrative} />
            </div>
            <div className="retro-card is-gold git-collaborators-card">
              <div className="retro-card-title">CODING SQUAD</div>
              <div className="git-collaborators">
                {collaboratorsList
                  .sort((a, b) => (b.prsTogether + b.reviewsExchanged) - (a.prsTogether + a.reviewsExchanged))
                  .slice(0, 3)
                  .map((collab, index) => {
                    const messages = [
                      <>must be your best coding buddy! Reviewed <span className="highlight-number">{collab.reviewsExchanged}</span> of your PRs like a boss.</>,
                      <>is your partner in crime! <span className="highlight-number">{collab.prsTogether}</span> PRs shipped together - unstoppable duo.</>,
                      <>got your back! <span className="highlight-number">{collab.reviewsExchanged}</span> reviews and <span className="highlight-number">{collab.prsTogether}</span> collabs - true teammate.</>
                    ];
                    return (
                      <div key={collab.username + index} className="collab-story">
                        {collab.avatar && (
                          <div className="avatar-wrapper">
                            <img src={collab.avatar} alt={collab.username} className="retro-avatar collab-avatar" />
                          </div>
                        )}
                        <span className="collab-text">
                          <span className="collab-name">@{collab.username}</span> {messages[index]}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>

          {/* Skills Module */}
          <section className="retro-section skills-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">SKILL MATRIX</div>
            <TerminalCommand className="skills-command mb-4" text="> analyze --languages --frameworks" />

            <div className="retro-card is-blue mb-4">
              <div className="retro-card-title">LANGUAGES</div>
              <div className="space-y-2 language-bars">
                {languageBars.map((lang, index) => (
                  <div key={lang.label + index} className="stat-row">
                    <span className="label">{lang.label}</span>
                    <span
                      className={clsx('mono spark language-bar', lang.tone ? `tone-${lang.tone}` : null)}
                      data-target={lang.percent}
                      data-bar={lang.bar}
                    >
                      {lang.bar}
                    </span>
                    <span className="value">{lang.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="retro-card is-blue mb-4">
              <div className="retro-card-title">FRAMEWORKS</div>
              <div className="space-y-2 framework-bars">
                {frameworkBars.map((fw, index) => (
                  <div key={fw.label + index} className="stat-row">
                    <span className="label">{fw.label}</span>
                    <span
                      className={clsx('mono spark framework-bar', fw.tone ? `tone-${fw.tone}` : null)}
                      data-hours={fw.hours}
                      data-bar={fw.bar}
                    >
                      {fw.bar}
                    </span>
                    <span className="value">{fw.hours.toLocaleString()}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="retro-card is-gold">
              <div className="retro-card-title">LEVELING UP 🎮</div>
              <div className="space-y-2 leveling-bars">
                {levelingUp.map((skill, index) => (
                  <div key={skill.label + index} className="stat-row">
                    <span className="label">{skill.label}</span>
                    <span
                      className={clsx('mono spark level-bar', skill.tone ? `tone-${skill.tone}` : null)}
                      data-level={skill.level}
                      data-bar={skill.bar}
                    >
                      {skill.bar}
                    </span>
                    <span className="value">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Delivery Module */}
          <section className="retro-section delivery-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">QUEST LOG</div>
            <TerminalCommand className="delivery-command mb-4" text="> getdata --jira --stories --bugs" />
            <DataCardGroup items={deliveryStats} className="delivery-cards mb-4" />

            <div className="retro-card is-red">
              <div className="retro-card-title">PROJECT PROGRESS</div>
              <div className="space-y-2 delivery-projects">
                {deliveryProjects.map((project, index) => (
                  <div key={project.label + index} className="stat-row">
                    <span className="label">{project.label}</span>
                    <span
                      className={clsx('mono spark project-bar', project.tone ? `tone-${project.tone}` : null)}
                      data-progress={project.percent}
                      data-bar={project.bar}
                    >
                      {project.bar}
                    </span>
                    <span className="value">{project.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CI/CD Module */}
          <section className="retro-section cicd-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">BUILD & DEPLOY</div>
            <TerminalCommand className="cicd-command mb-4" text="> monitor --builds --deployments --pipelines" />
            <DataCardGroup items={cicdCards} className="cicd-cards mb-4" />
            <div className="retro-card is-gold">
              <div className="retro-card-title">BUILD SUCCESS RATE</div>
              <div className="stat-row">
                <span className="label">{buildSuccessBar.label}</span>
                <span
                  className={clsx('mono spark build-success-bar', buildSuccessBar.tone ? `tone-${buildSuccessBar.tone}` : null)}
                  data-percent={buildSuccessBar.percent}
                  data-bar={buildSuccessBar.bar}
                >
                  {buildSuccessBar.bar}
                </span>
                <span className="value">{buildSuccessBar.percent}%</span>
              </div>
              <TypewriterText className="retro-card-note cicd-narrative" initialText={cicdNarrative} />
            </div>
          </section>

          {/* Copilot Module */}
          <section className="retro-section copilot-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">AI ASSIST LOG</div>
            <TerminalCommand className="copilot-command mb-4" text="> analyze --copilot --productivity" />
            <DataCardGroup items={copilotCards} className="copilot-cards mb-4" />
            <div className="retro-card is-purple">
              <div className="retro-card-title">COPILOT PERFORMANCE</div>
              <div className="stat-row">
                <span className="label">{copilotAcceptanceBar.label}</span>
                <span
                  className={clsx('mono spark copilot-acceptance-bar', copilotAcceptanceBar.tone ? `tone-${copilotAcceptanceBar.tone}` : null)}
                  data-percent={copilotAcceptanceBar.percent}
                  data-bar={copilotAcceptanceBar.bar}
                >
                  {copilotAcceptanceBar.bar}
                </span>
                <span className="value">{copilotAcceptanceBar.percent}%</span>
              </div>
              <TypewriterText className="retro-card-note copilot-narrative" initialText={copilotNarrative} />
            </div>
          </section>

          {/* Learning Module */}
          <section className="retro-section learning-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">LEARNING PATH</div>
            <TerminalCommand className="learning-command mb-4" text="> getdata --courses --certifications --growth" />
            <DataCardGroup items={learningCards} className="learning-cards mb-4" />
            <div className="retro-card is-gold">
              <div className="retro-card-title">GROWTH TRAJECTORY</div>
              <TypewriterText className="retro-card-note learning-narrative" initialText={learningNarrative} />
            </div>
          </section>

          {/* Community Module */}
          <section className="retro-section community-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">COMMUNITY IMPACT</div>
            <TerminalCommand className="community-command mb-4" text="> getdata --bravos --events --contributions" />
            <DataCardGroup items={communityCards} className="community-cards mb-4" />
            <div className="retro-card is-blue">
              <div className="retro-card-title">ACTIVITIES</div>
              <div className="space-y-2 community-activities">
                {communityActivities.map((activity, index) => (
                  <div key={activity.name + index} className="activity-row">
                    <span className="activity-date">{activity.date}</span>
                    <span className="activity-name">{activity.icon} {activity.name}</span>
                  </div>
                ))}
              </div>
              <TypewriterText className="retro-card-note community-narrative mt-2" initialText={communityNarrative} />
            </div>
          </section>

          {/* Summary */}
          <section className="retro-section summary-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">SUMMARY</div>
            <TerminalCommand className="summary-command mb-4" text="> compute --score --achievements" />
            <div className="retro-card is-gold mb-4">
              <div className="retro-card-title">FINAL SCORE</div>
              <div className="summary-score">{summary.overallScore}</div>
              <div className="retro-card-note text-center mt-2">+{summary.growthPercentage}% power growth from last year</div>
            </div>
            <div className="retro-card is-blue mb-4">
              <div className="retro-card-title">HIGHLIGHTS</div>
              <div className="space-y-2">
                {summary.highlights.map((highlight, index) => (
                  <div key={index} className="highlight-text">• {parseHighlight(highlight)}</div>
                ))}
              </div>
            </div>
            <div className="achievement-grid mb-4">
              {achievements.map((ach, index) => (
                <div key={ach.name + index} className={clsx('achievement-card', rarityClass(ach.rarity))}>
                  <div className="name">{ach.icon} {ach.name}</div>
                  <div className="rarity">[{ach.rarity.toUpperCase()}]</div>
                  <div className="retro-card-note">{ach.note}</div>
                </div>
              ))}
            </div>
            <div
              className="menu-line summary-menu"
              style={{
                opacity: showMenu ? 1 : 0,
                visibility: showMenu ? 'visible' : 'hidden',
                pointerEvents: showMenu ? 'auto' : 'none',
              }}
            >
              <span onClick={onReplay}>[R]eplay</span>
              <span>[D]ownload</span>
              <span>[S]hare</span>
            </div>
          </section>
        </div>
      </div>
    );
  }
);

DataPage.displayName = 'DataPage';
