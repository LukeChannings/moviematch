import React, {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";

import {
  useCombobox,
  useMultipleSelection,
} from "https://cdn.skypack.dev/downshift?dts";
import { usePopper } from "https://cdn.skypack.dev/react-popper?dts";
import { FilterValue } from "/types/moviematch.ts";

import "./AutoSuggestInput.css";

interface AutoSuggestInputProps {
  items: FilterValue[];
  onChange: (value: FilterValue[]) => void;
}

export const AutoSuggestInput = (
  { items, onChange }: AutoSuggestInputProps,
) => {
  const [inputValue, setInputValue] = useState<string>("");
  const {
    getSelectedItemProps,

    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: [] as FilterValue[] });
  const referenceElement = useRef<HTMLDivElement>();
  const popperElement = useRef<HTMLDivElement>();
  const arrowElement = useRef<HTMLDivElement>();
  const { styles, attributes } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      modifiers: [{
        name: "arrow",
        options: { element: arrowElement.current },
      }],
    },
  );

  useEffect(() => {
    onChange(selectedItems);
  }, [selectedItems]);

  const getFilteredItems = () =>
    items.filter(
      (item) =>
        !selectedItems.includes(item) &&
        item.title.toLowerCase().startsWith(inputValue.toLowerCase()),
    );
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0,
    selectedItem: null,
    items: getFilteredItems(),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: false,
          };
      }
      return changes;
    },
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue!);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (typeof selectedItem?.value === "string") {
            setInputValue("");
            addSelectedItem(selectedItem);
          }
          break;
        default:
          break;
      }
    },
  });
  console.log({ isOpen, selectedItems });
  return (
    <>
      <div ref={referenceElement}>
        {selectedItems.map((selectedItem, index) => (
          <span
            key={`selected-item-${index}`}
            {...getSelectedItemProps({ selectedItem, index })}
          >
            {selectedItem.title}
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedItem(selectedItem);
              }}
            >
              &#10005;
            </span>
          </span>
        ))}
        <div {...getComboboxProps()}>
          <input
            className="AutoSuggestInput"
            {...getInputProps(
              getDropdownProps({ preventKeyAction: isOpen }),
            )}
          />
        </div>
      </div>
      {isOpen &&
        <ul
          {...getMenuProps()}
          ref={popperElement}
          style={styles.popper}
          className="AutoSuggestSuggestions"
        >
          <div
            ref={arrowElement}
            className="AutoSuggestSuggestionsArrow"
            style={styles.arrow}
          />
          {getFilteredItems().slice(0, 10).map((item, index) => (
            <li
              className="AutoSuggestSuggestion"
              style={highlightedIndex === index
                ? { backgroundColor: "#bde4ff" }
                : {}}
              key={`${item.value}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.title}
            </li>
          ))}
        </ul>}
    </>
  );
};
