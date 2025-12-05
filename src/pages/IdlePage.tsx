import { forwardRef, useCallback, useMemo, useState } from "react";
import MatrixHighPerf from "../components/MatrixHighPerf";
import {
  ASCII_ANNUAL_REVIEW,
  ASCII_DEVELOPER,
  ASCII_STATESTREET,
} from "../constants/ascii-art";

interface IdlePageProps {
  cursorRef: React.RefObject<HTMLSpanElement | null>;
  onExecutiveMode?: () => void;
  statusMessage?: string | null;
  errorMessage?: string | null;
  isBusy?: boolean;
}

export const IdlePage = forwardRef<HTMLDivElement, IdlePageProps>(
  ({ cursorRef, statusMessage, errorMessage, isBusy }, ref) => {
    const [doneCount, setDoneCount] = useState(0);
    const titlesDone = useMemo(() => doneCount >= 1, [doneCount]);
    const promptOpacity = titlesDone ? 1 : 0;

    const handleSegmentComplete = useCallback(() => {
      setDoneCount((prev) => prev + 1);
    }, []);

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
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-baseline gap-2">
                <span>
                  {isBusy
                    ? statusMessage || "[ Working... ]"
                    : "[ Press ENTER to Initialize System ]"}
                </span>
                <span
                  ref={cursorRef}
                  style={{
                    width: "0.5ch", // 宽度等于当前字体一个字符的宽 (0)
                    height: "1em", // 高度等于当前字号
                    backgroundColor: "var(--text-primary)", // 黑客帝国绿 (或者用 'currentColor' 跟随文字)
                    marginLeft: "2px", // 稍微跟文字拉开一点点距离
                    transform: "translateY(0.2em)",
                  }}
                />
              </div>
              {/* {onExecutiveMode && (
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--accent-highlight)', fontSize: '0.875rem' }}
                  onClick={onExecutiveMode}
                >
                  [ Press E for Executive Dashboard ]
                </div>
              )} */}
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

IdlePage.displayName = "IdlePage";
