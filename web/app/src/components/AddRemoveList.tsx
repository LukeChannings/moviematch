import React, {
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./AddRemoveList.css";

interface AddRemoveListProps {
  children: () => ReactNode;
  initialChildren?: number;
}

export const AddRemoveList = ({
  children,
  initialChildren = 1,
}: AddRemoveListProps) => {
  const [childList, setChildList] = useState(
    Array.from({ length: initialChildren }).map((_, i) => i)
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
          {children()}
          <div className="AddRemoveList_Item_Controls">
            {childList.length !== 0 && (
              <button
                type="button"
                className="AddRemoveList_Subtract"
                onClick={() => {
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
