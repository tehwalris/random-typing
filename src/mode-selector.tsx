import { css } from "@emotion/css";
import * as React from "react";

export type GameMode = "full" | "homerow";

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-top: 30px;
  `,
  button: css`
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  `,
};

interface Props {
  onSelect: (mode: GameMode) => void;
}

export const ModeSelector = ({ onSelect }: Props) => {
  return (
    <div className={styles.wrapper}>
      <h2>Select your typing mode</h2>
      <button className={styles.button} onClick={() => onSelect("full")}>
        Full Keyboard
      </button>
      <button className={styles.button} onClick={() => onSelect("homerow")}>
        Home Row Only
      </button>
    </div>
  );
};