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
}

export const AddRemoveList = ({ children }: AddRemoveListProps) => {
  const [childList, setChildList] = useState([1]);

  return (
    <ul className="AddRemoveList">
      {childList.map((i) => (
        <li key={i} className="AddRemoveList_Item">
          {children()}
          <div className="AddRemoveList_Item_Controls">
            {childList.length > 1 && (
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
