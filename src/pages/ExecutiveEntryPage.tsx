import { forwardRef, useCallback, useMemo, useState } from "react";
import MatrixHighPerf from "../components/MatrixHighPerf";
import {
  ASCII_ANNUAL_REVIEW,
  ASCII_DEVELOPER,
  ASCII_STATESTREET,
} from "../constants/ascii-art";

interface ExecutiveEntryPageProps {
  cursorRef: React.RefObject<HTMLSpanElement | null>;
  onEmailSubmit?: (email: string) => void;
  statusMessage?: string | null;
  errorMessage?: string | null;
  isBusy?: boolean;
}

export const ExecutiveEntryPage = forwardRef<HTMLDivElement, ExecutiveEntryPageProps>(
  ({ onEmailSubmit, statusMessage, errorMessage, isBusy }, ref) => {
    const [doneCount, setDoneCount] = useState(0);
    const [email, setEmail] = useState('');
    const titlesDone = useMemo(() => doneCount >= 1, [doneCount]);
    const promptOpacity = titlesDone ? 1 : 0;

    const handleSegmentComplete = useCallback(() => {
      setDoneCount((prev) => prev + 1);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isBusy && onEmailSubmit) {
        onEmailSubmit(email); // Can be empty for demo
      }
    }, [email, isBusy, onEmailSubmit]);

    const { headerAscii, lineColors } = useMemo(() => {
      const segments = [
        { ascii: ASCII_STATESTREET, color: "var(--accent-info)" },
        { ascii: ASCII_DEVELOPER, color: "var(--accent-success)" },
        { ascii: ASCII_ANNUAL_REVIEW, color: "var(--accent-highlight)" },
      ];

      const allLines: string[] = [];
      const colors: string[] = [];

      segments.forEach(({ ascii, color }) => {
        const lines = ascii.split("\n");
        if (lines.length && lines[0].trim() === "") lines.shift();
        if (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
        lines.forEach((line) => {
          allLines.push(line);
          colors.push(color);
        });
      });

      return {
        headerAscii: allLines.join("\n"),
        lineColors: colors,
      };
    }, []);

    return (
      <div
        ref={ref}
        className="fixed inset-0 flex flex-col items-center justify-center px-4 w-screen h-screen bg-(--bg-primary)"
        style={{ paddingTop: "40px" }}
      >
        <MatrixHighPerf
          text={headerAscii}
          colorMatrix="#00FF41"
          initialColor="#FFFFFF"
          colorFinal="var(--text-primary)"
          lineFinalColors={lineColors}
          chars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
          fontSize={18}
          className="absolute inset-0"
          onComplete={handleSegmentComplete}
        />
        <div className="relative z-20 flex flex-col items-center w-full gap-6 flex-1 justify-end pb-16 pointer-events-none">
          <div
            className="idle-prompt flex flex-col items-center gap-3 text-base font-mono transition-opacity duration-2000"
            style={{
              color: "var(--text-primary)",
              opacity: promptOpacity,
              pointerEvents: titlesDone ? "auto" : "none",
              transitionDelay: titlesDone ? "0.3s" : "0s",
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm" style={{ color: 'var(--accent-highlight)' }}>
                [ EXECUTIVE DASHBOARD ACCESS ]
              </div>

              <div className="flex items-center gap-2">
                <span>
                  {isBusy
                    ? statusMessage || "[ Loading... ]"
                    : "> Enter email:"}
                </span>
                {!isBusy && (
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    placeholder="user@example.com"
                    className="bg-transparent border-none outline-none font-mono"
                    style={{
                      color: 'var(--text-primary)',
                      width: '280px',
                      borderBottom: '1px solid var(--accent-info)',
                      paddingBottom: '2px',
                    }}
                  />
                )}
              </div>

              <div className="text-sm" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                [ Press ENTER to continue ]
              </div>

              {errorMessage && (
                <div
                  className="text-sm text-center"
                  style={{ color: "var(--accent-error)" }}
                >
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ExecutiveEntryPage.displayName = "ExecutiveEntryPage";
