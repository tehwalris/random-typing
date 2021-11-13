import { css } from "@emotion/css";
import { sample, shuffle } from "lodash";
import { zip, last } from "ramda";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { HomeRow } from "./home-row";

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
  `,
  history: css`
    margin-top: 10px;
  `,
  typingArea: css`
    display: inline-block;

    &:focus {
      outline: 1px solid blue;
    }

    &:not(:focus) {
      opacity: 0.5;
    }
  `,
  expectedLetter: css`
    font-size: 40px;
    margin-bottom: 20px;
  `,
  progress: css`
    width: 575px;
  `,
};

const enabledKeys = [
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "Semicolon",
];

const alphabet: string[] = [];
for (let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
  alphabet.push(String.fromCharCode(i).toUpperCase());
}

function pickRandomMapEntry<K, V>(
  map: Map<K, V>,
  filterCb: (entry: [K, V]) => boolean,
): [K, V] {
  const entries = [...map.entries()].filter(filterCb);
  if (!entries.length) {
    throw new Error("empty filtered map");
  }
  return sample(entries)!;
}

export const App = () => {
  const randomLayout = useMemo(
    () => new Map<string, string>(zip(enabledKeys, shuffle(alphabet))),
    [],
  );

  const [_expectedLetter, _setExpectedLetter] = useState<string>();
  const expectedLetter = useMemo(
    () =>
      _expectedLetter && new Set(randomLayout.values()).has(_expectedLetter)
        ? _expectedLetter
        : pickRandomMapEntry(randomLayout, () => true)[1],
    [_expectedLetter, randomLayout],
  );

  const [maskLevel, setMaskLevel] = useState(0);
  const [maskOrder, setMaskOrder] = useState(
    shuffle(enabledKeys.map((k, i) => i)),
  );
  useEffect(() => {
    setMaskLevel(0);
    setMaskOrder(shuffle(enabledKeys.map((k, i) => i)));
  }, [randomLayout]);
  const mask = useMemo(() => {
    const mask = maskOrder.map(() => false);
    for (const i of maskOrder.slice(0, maskLevel)) {
      mask[i] = true;
    }
    return mask;
  }, [maskLevel, maskOrder]);

  const [history, setHistory] = useState<
    {
      expectedLetter: String;
      actualLetter: string | undefined;
      masked: boolean;
    }[]
  >([]);
  useEffect(() => {
    setHistory([]);
  }, [randomLayout]);
  const pressedLetter = last(history)?.actualLetter;

  const onKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();

    const letter = randomLayout.get(ev.code);
    const expectedLetterIndex = enabledKeys
      .map((k) => randomLayout.get(k))
      .indexOf(expectedLetter);
    setHistory((h) => [
      ...h,
      {
        expectedLetter,
        actualLetter: letter,
        masked: expectedLetterIndex !== -1 && mask[expectedLetterIndex],
      },
    ]);
    if (letter === expectedLetter) {
      _setExpectedLetter(
        pickRandomMapEntry(randomLayout, ([_c, l]) => l !== letter)[1],
      );
      if (
        maskLevel < enabledKeys.length &&
        randomLayout.get(enabledKeys[maskOrder[maskLevel]]) === letter
      ) {
        setMaskLevel(maskLevel + 1);
      }
    } else {
      setMaskLevel(Math.max(0, maskLevel - 1));
    }
  };

  useEffect(() => {
    const requiredCount = 10;
    const lastHistory = history.slice(-requiredCount);
    if (
      !mask.every((v) => v) ||
      lastHistory.length < requiredCount ||
      !lastHistory.every((h) => h.actualLetter === h.expectedLetter && h.masked)
    ) {
      return;
    }
    alert("You won!");
  }, [history, mask]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.expectedLetter}>{expectedLetter}</div>
      <HomeRow
        letters={enabledKeys.map((k) => randomLayout.get(k)!)}
        mask={mask}
        expectedLetter={expectedLetter}
        pressedLetter={pressedLetter}
      />
      <div className={styles.history}>
        {!history.length && <>&nbsp;</>}
        {history
          .map((h, i) => ({ h, i }))
          .slice(-10)
          .map(({ h, i }) => (
            <span
              key={i}
              style={{
                color: h.actualLetter === h.expectedLetter ? "green" : "red",
                textDecoration: h.masked ? "underline" : undefined,
              }}
            >
              {h.actualLetter || "?"}
            </span>
          ))}
      </div>
      <div>
        <progress
          className={styles.progress}
          value={mask.filter((v) => v).length}
          max={enabledKeys.length}
        />
      </div>
      <div tabIndex={0} className={styles.typingArea} onKeyDown={onKeyDown}>
        Type here
      </div>
    </div>
  );
};
