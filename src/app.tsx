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

interface HistoryEntry {
  expectedLetter: String;
  actualLetter: string | undefined;
  masked: boolean;
}

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

const streakToHide = 3;
const streakToWin = 10;

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

  const [mask, setMask] = useState(() => enabledKeys.map(() => false));

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    setHistory([]);
  }, [randomLayout]);
  const pressedLetter = last(history)?.actualLetter;

  const onKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    const actualLetter = randomLayout.get(ev.code);
    const actualLetterIndex = enabledKeys.indexOf(ev.code);
    const expectedLetterIndex = enabledKeys
      .map((k) => randomLayout.get(k))
      .indexOf(expectedLetter);
    if (
      actualLetter === undefined ||
      actualLetterIndex === -1 ||
      expectedLetterIndex === -1
    ) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    const newHistory: HistoryEntry[] = [
      ...history,
      {
        expectedLetter,
        actualLetter: actualLetter,
        masked: expectedLetterIndex !== -1 && mask[expectedLetterIndex],
      },
    ];
    setHistory(newHistory);

    const latestActualHistory = newHistory
      .filter((h) => h.actualLetter === actualLetter)
      .slice(-streakToHide);
    const newMaskValue =
      latestActualHistory.length === streakToHide &&
      latestActualHistory.every((h) => h.actualLetter === h.expectedLetter);

    const newMask: boolean[] = [...mask];
    newMask[actualLetterIndex] = newMaskValue;
    setMask(newMask);

    if (actualLetter === expectedLetter) {
      _setExpectedLetter(
        pickRandomMapEntry(randomLayout, ([_c, l]) => l !== actualLetter)[1],
      );
    }
  };

  useEffect(() => {
    const lastHistory = history.slice(-streakToWin);
    if (
      !mask.every((v) => v) ||
      lastHistory.length < streakToWin ||
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
          .slice(-streakToWin)
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
