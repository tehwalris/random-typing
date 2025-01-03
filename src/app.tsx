import { css } from "@emotion/css";
import { sample, shuffle } from "lodash";
import { last, zip } from "ramda";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { GameMode, ModeSelector } from "./mode-selector";
import { keySpacingPx, keyWidthPx, Row } from "./row";

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
  rows: css`
    display: flex;
    flex-direction: column;
    align-items: center;

    & > div:first-child {
      margin-right: ${keyWidthPx + keySpacingPx}px;
    }

    & > div:not(:last-child) {
      margin-bottom: 5px;
    }
  `,
};

interface HistoryEntry {
  expectedLetter: String;
  actualLetter: string | undefined;
  masked: boolean;
}

const keyboardLayouts = {
  full: [
    [
      "KeyQ",
      "KeyW",
      "KeyE",
      "KeyR",
      "KeyT",
      "KeyY",
      "KeyU",
      "KeyI",
      "KeyO",
      "KeyP",
    ],
    [
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
    ],
    ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period"],
  ],
  homerow: [
    [],
    [
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
    ],
    [],
  ],
};

const getEnabledKeys = (mode: GameMode) => keyboardLayouts[mode].flat();

const alphabet: string[] = [];
for (let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
  alphabet.push(String.fromCharCode(i).toUpperCase());
}
alphabet.push(";", ",", "!");

const streakToHide = 3;
const streakToWin = 10;

function pickMaskWeightedEntry(
  layout: Map<string, string>,
  mask: boolean[],
  lastKey: string | undefined,
): [string, string] {
  const entryFromKey = (k: string): [string, string] => {
    const v = layout.get(k);
    if (v === undefined) {
      throw new Error("layout is not consistent with enabledKeys");
    }
    return [k, v];
  };

  const options = enabledKeys
    .filter((k) => k !== lastKey)
    .map((k, i) => ({ k, maskValue: mask[i] }));
  const trueOptions = options.filter((o) => o.maskValue);
  const falseOptions = options.filter((o) => !o.maskValue);
  if (!trueOptions.length || !falseOptions.length) {
    return entryFromKey(sample(options)!.k);
  }
  const trueProbability = 0.5;
  const chosenBooleanOptions =
    Math.random() < trueProbability ? trueOptions : falseOptions;
  return entryFromKey(sample(chosenBooleanOptions)!.k);
}

export const App = () => {
  const [mode, setMode] = useState<GameMode>();
  const enabledKeys = mode ? getEnabledKeys(mode) : [];
  const randomLayout = useMemo(
    () => new Map<string, string>(zip(enabledKeys, shuffle(alphabet))),
    [mode],
  );

  const [_expectedLetter, _setExpectedLetter] = useState<string>();
  const expectedLetter = useMemo(
    () =>
      _expectedLetter && new Set(randomLayout.values()).has(_expectedLetter)
        ? _expectedLetter
        : pickMaskWeightedEntry(
            randomLayout,
            enabledKeys.map(() => false),
            undefined,
          )[1],
    [_expectedLetter, randomLayout],
  );

  const [mask, setMask] = useState(() => enabledKeys.map(() => false));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    setMask(enabledKeys.map(() => false));
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
        pickMaskWeightedEntry(randomLayout, newMask, ev.code)[1],
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

  const renderRow = (rowIndex: number, groupLengths: number[]) => (
    <Row
      letters={enabledKeysByRow[rowIndex].map((k) => randomLayout.get(k)!)}
      mask={enabledKeysByRow[rowIndex]
        .map((k) => enabledKeys.indexOf(k))
        .map((i) => mask[i])}
      groupLengths={groupLengths}
      expectedLetter={expectedLetter}
      pressedLetter={pressedLetter}
    />
  );

  if (!mode) {
    return <ModeSelector onSelect={setMode} />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.expectedLetter}>{expectedLetter}</div>
      <div className={styles.rows}>
        {mode === "full" && renderRow(0, [5, 1, 4])}
        {renderRow(1, [4, 2, 4])}
        {mode === "full" && renderRow(2, [4, 1, 4])}
      </div>
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
