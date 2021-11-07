import * as React from "react";
import { shuffle, sample } from "lodash";
import { zip } from "ramda";
import { useMemo, useState } from "react";

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

function pickRandomMapEntry<K, V>(map: Map<K, V>): [K, V] {
  if (!map.size) {
    throw new Error("empty map");
  }
  const entries = [...map.entries()];
  return sample(entries)!;
}

export const App = () => {
  const randomLayout = useMemo(
    () => new Map<string, string>(zip(enabledKeys, shuffle(alphabet))),
    [],
  );

  const expectedLetter = useMemo(() => pickRandomMapEntry(randomLayout)[1], [
    randomLayout,
  ]);

  return (
    <div>
      <div>{JSON.stringify([...randomLayout.entries()])}</div>
      <div>Expected: {expectedLetter}</div>
    </div>
  );
};
