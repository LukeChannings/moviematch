import React, { ReactNode, useState } from "react";

import styles from "./AddRemoveList.module.css";

interface AddRemoveListProps {
  children: (index: number) => ReactNode;
  initialChildren?: number;
  onRemove?: (index: number) => void;
  testHandle?: string;
}

export const AddRemoveList = ({
  children,
  initialChildren = 1,
  onRemove,
  testHandle,
}: AddRemoveListProps) => {
  const [childList, setChildList] = useState(
    Array.from({ length: initialChildren }).map((_, i) => i),
  );

  return (
    <ul className={styles.list}>
      {childList.length === 0 && (
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setChildList([0])}
          data-test-handle={testHandle && `${testHandle}-add-button`}
        >
          {"+"}
        </button>
      )}
      {childList.map((i) => (
        <li key={i} className={styles.listItem}>
          {children(i)}
          <div className={styles.controls}>
            {i >= initialChildren && (
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  if (onRemove) {
                    onRemove(i);
                  }
                  setChildList(childList.filter((_) => _ !== i));
                }}
                data-test-handle={testHandle &&
                  `${testHandle}-${i}-remove-button`}
              >
                {"-"}
              </button>
            )}
            {childList[childList.length - 1] === i && (
              <button
                type="button"
                className={styles.addButton}
                onClick={() => {
                  setChildList([
                    ...childList,
                    childList[childList.length - 1] + 1,
                  ]);
                }}
                data-test-handle={testHandle && `${testHandle}-add-button`}
              >
                {"+"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
