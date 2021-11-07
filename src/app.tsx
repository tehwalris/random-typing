import { css } from "@emotion/css";
import { sample, shuffle } from "lodash";
import { zip } from "ramda";
import * as React from "react";
import { useMemo, useState } from "react";
import { HomeRow } from "./home-row";

const styles = {
  typingArea: css`
    display: inline-block;

    &:focus {
      outline: 1px solid blue;
    }

    &:not(:focus) {
      opacity: 0.5;
    }
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
  alphabet.push(String.fromCharCode(i));
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

  const [pressedLetter, setPressedLetter] = useState<string>();

  const onKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();

    const letter = randomLayout.get(ev.code);
    setPressedLetter(letter);
    if (letter === expectedLetter) {
      _setExpectedLetter(
        pickRandomMapEntry(randomLayout, ([_c, l]) => l !== letter)[1],
      );
    }
  };

  return (
    <div>
      <HomeRow
        letters={enabledKeys.map((k) => randomLayout.get(k)!)}
        expectedLetter={expectedLetter}
        pressedLetter={pressedLetter}
      />
      <div>Expected: {expectedLetter}</div>
      <div>Pressed: {pressedLetter}</div>
      <div tabIndex={0} className={styles.typingArea} onKeyDown={onKeyDown}>
        Type here
      </div>
    </div>
  );
};
