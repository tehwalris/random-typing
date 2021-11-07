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
  expectedLetter: string;
  pressedLetter: string | undefined;
}

export const HomeRow = ({ letters, expectedLetter, pressedLetter }: Props) => {
  if (letters.length !== 10) {
    throw new Error("unexpected number of letters");
  }

  return (
    <div>
      {[
        [0, 4],
        [4, 6],
        [6, 10],
      ].map(([start, end], i) => (
        <div key={i} className={styles.group}>
          {letters.slice(start, end).map((letter, j) => (
            <div
              key={j + start}
              className={styles.key}
              style={{
                background:
                  letter === pressedLetter
                    ? "grey"
                    : letter === expectedLetter
                    ? "green"
                    : undefined,
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
