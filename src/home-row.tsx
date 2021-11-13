import { css } from "@emotion/css";

const styles = {
  group: css`
    margin-right: 15px;
    display: inline-block;
  `,
  key: css`
    display: inline-block;
    margin-right: 5px;
    width: 50px;
    height: 50px;
    border: 1px solid black;
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
                      ? "grey"
                      : letter === expectedLetter && !hide
                      ? "green"
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
