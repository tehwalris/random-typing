import { css } from "@emotion/css";

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
    margin-right: 5px;
    width: 50px;
    height: 50px;
    border: 1px solid black;

    &:last-child {
      margin-right: 0;
    }
  `,
};

interface Props {
  letters: string[];
  mask: boolean[];
  expectedLetter: string;
  pressedLetter: string | undefined;
}

export const HomeRow = ({
  letters,
  mask,
  expectedLetter,
  pressedLetter,
}: Props) => {
  if (letters.length !== 10) {
    throw new Error("unexpected number of letters");
  }
  if (mask.length !== letters.length) {
    throw new Error("invalid mask");
  }

  return (
    <div>
      {[
        [0, 4],
        [4, 6],
        [6, 10],
      ].map(([start, end], iGroup) => (
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
                    letter === pressedLetter
                      ? "rgba(0, 0, 0, 0.15)"
                      : letter === expectedLetter && !hide
                      ? "rgba(0, 20, 255, 0.4)"
                      : undefined,
                }}
              >
                {hide ? "?" : letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
