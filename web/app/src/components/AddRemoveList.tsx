import React, {
  ReactNode,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./AddRemoveList.css";

interface AddRemoveListProps {
  children: (index: number) => ReactNode;
  initialChildren?: number;
  onRemove?: (index: number) => void;
}

export const AddRemoveList = ({
  children,
  initialChildren = 1,
  onRemove,
}: AddRemoveListProps) => {
  const [childList, setChildList] = useState(
    Array.from({ length: initialChildren }).map((_, i) => i),
  );

  return (
    <ul className="AddRemoveList">
      {childList.length === 0 && (
        <button
          type="button"
          className="AddRemoveList_Add"
          onClick={() => setChildList([0])}
        >
          {"+"}
        </button>
      )}
      {childList.map((i) => (
        <li key={i} className="AddRemoveList_Item">
          {children(i)}
          <div className="AddRemoveList_Item_Controls">
            {i >= initialChildren && (
              <button
                type="button"
                className="AddRemoveList_Subtract"
                onClick={() => {
                  if (onRemove) {
                    onRemove(i);
                  }
                  setChildList(childList.filter((_) => _ !== i));
                }}
              >
                {"-"}
              </button>
            )}
            {childList[childList.length - 1] === i && (
              <button
                type="button"
                className="AddRemoveList_Add"
                onClick={() => {
                  setChildList([
                    ...childList,
                    childList[childList.length - 1] + 1,
                  ]);
                }}
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
