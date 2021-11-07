import * as React from "react";
import { shuffle } from "lodash";
import { zip } from "ramda";

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

const alphabet = [];
for (let i = "a".charCodeAt(0); i <= "z".charCodeAt(0); i++) {
  alphabet.push(String.fromCharCode(i));
}

const randomLayout = new Map<string, string>(
  zip(enabledKeys, shuffle(alphabet)),
);

export const App = () => (
  <div>{JSON.stringify([...randomLayout.entries()])}</div>
);
