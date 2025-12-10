import { useMemo } from 'react';
import clsx from 'clsx';
import type { TeamJiraData } from '../../types/executive';
import { TeamJiraAdapter } from '../../adapters/ExecutiveAdapter';
import { DataCardGroup } from '../retro/DataCardGroup';
import { TypewriterText } from '../retro/TypewriterText';

interface JiraSectionProps {
  data: TeamJiraData;
}

export const JiraSection: React.FC<JiraSectionProps> = ({ data }) => {
  const cards = useMemo(() => TeamJiraAdapter.toStatCards(data), [data]);
  const completionBar = useMemo(() => TeamJiraAdapter.toCompletionBar(data), [data]);
  const narrative = useMemo(() => TeamJiraAdapter.toNarrative(data), [data]);

  return (
    <>
      <DataCardGroup items={cards} className="jira-cards mb-4" columns={2} />

      <div className="retro-card is-blue">
        <div className="retro-card-title">TICKET COMPLETION</div>
        <div className="stat-row">
          <span className="label">{completionBar.label}</span>
          <span
            className={clsx('mono spark completion-bar', completionBar.tone ? `tone-${completionBar.tone}` : null)}
            data-percent={completionBar.percent}
            data-bar={completionBar.bar}
          >
            {completionBar.bar}
          </span>
          <span className="value">{completionBar.percent}%</span>
        </div>
        <TypewriterText className="retro-card-note jira-narrative mt-2" initialText={narrative} />
      </div>
    </>
  );
};
