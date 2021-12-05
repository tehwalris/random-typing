import { css } from "@emotion/css";
import { sum } from "ramda";

export const keyWidthPx = 50;
export const keySpacingPx = 5;

const styles = {
  group: css`
    margin-right: 15px;
    display: inline-block;

    &:last-child {
      margin-right: 0;
    }
  `,
  key: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    margin-right: ${keySpacingPx}px;
    width: ${keyWidthPx}px;
    height: ${keyWidthPx}px;
    border: 1px solid black;

    &:last-child {
      margin-right: 0;
    }
  `,
};

interface Props {
  letters: string[];
  mask: boolean[];
  groupLengths: number[];
  expectedLetter: string;
  pressedLetter: string | undefined;
}

export const Row = ({
  letters,
  mask,
  groupLengths,
  expectedLetter,
  pressedLetter,
}: Props) => {
  const totalLength = sum(groupLengths);

  if (letters.length !== totalLength) {
    throw new Error("unexpected number of letters");
  }
  if (mask.length !== totalLength) {
    throw new Error("invalid mask");
  }

  const groupRanges: [number, number][] = [];
  {
    let i = 0;
    for (const l of groupLengths) {
      groupRanges.push([i, i + l]);
      i += l;
    }
  }

  return (
    <div>
      {groupRanges.map(([start, end], iGroup) => (
        <div key={iGroup} className={styles.group}>
          {letters.slice(start, end).map((letter, iKeyInGroup) => {
            const iKey = start + iKeyInGroup;
            const hide = mask[iKey];
            return (
              <div
                key={iKey}
                className={styles.key}
                style={{
                  background:
                    letter === expectedLetter && !hide
                      ? "rgba(0, 20, 255, 0.4)"
                      : letter === pressedLetter
                      ? "rgba(0, 0, 0, 0.15)"
                      : undefined,
                }}
              >
                {hide ? (
                  <span style={{ opacity: 0.2 }}>?</span>
                ) : (
                  <span>{letter}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
