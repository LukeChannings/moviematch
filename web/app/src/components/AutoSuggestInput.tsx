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
import { Pill } from "./Pill.tsx";

interface AutoSuggestInputProps {
  items: FilterValue[];
  onChange: (value: FilterValue[]) => void;
}

export const AutoSuggestInput = (
  { items, onChange }: AutoSuggestInputProps,
) => {
  const [inputValue, setInputValue] = useState<string>("");
  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: [] as FilterValue[] });
  const referenceElement = useRef<HTMLDivElement>();
  const popperElement = useRef<HTMLUListElement>();

  const { styles, attributes, update: updatePopper } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 10],
          },
        },
      ],
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
  const comboBox = useCombobox({
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
            isOpen: true,
          };
      }
      return changes;
    },
    onStateChange: (change) => {
      const { inputValue, type, selectedItem } = change;
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue!);
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (typeof selectedItem?.value === "string") {
            setInputValue("");
            addSelectedItem(selectedItem);
            updatePopper();
          }
          break;
        default:
          break;
      }
    },
  });

  const {
    isOpen,
    openMenu,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = comboBox;

  const filteredItems = getFilteredItems();
  const menuProps = getMenuProps();
  const inputProps = getInputProps(
    getDropdownProps({ preventKeyAction: isOpen }),
  );

  console.log(comboBox);

  return (
    <>
      <div
        {...getComboboxProps()}
        className="AutoSuggestInputContainer"
      >
        <div className="AutoSuggestInputSelections">
          {selectedItems.map((selectedItem, index) => (
            <>
              {index !== 0 &&
                <span className="AutoSuggestInputSelectionsDelimiterLabel">
                  or
                </span>}
              <Pill
                key={`selected-item-${index}`}
                onRemove={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItem);
                }}
              >
                {selectedItem.title}
              </Pill>
            </>
          ))}
        </div>
        <input
          className="AutoSuggestInput"
          {...inputProps}
          ref={(el) => {
            referenceElement.current = (el);
            inputProps.ref(el);
          }}
        />
      </div>
      {(isOpen && filteredItems.length !== 0) &&
        <ul
          {...menuProps}
          ref={(menuEl) => {
            if (menuEl) {
              popperElement.current = menuEl;
              menuProps.ref(menuEl);
            }
          }}
          style={styles.popper}
          {...attributes.popper}
          className="AutoSuggestSuggestions"
        >
          <div
            data-popper-arrow
            className="AutoSuggestSuggestionsArrow"
            style={styles.arrow}
            {...attributes.arrow}
          >
          </div>
          <div className="AutoSuggestSuggestionsScrollBox">
            {getFilteredItems().map((item, index) => (
              <li
                className={`AutoSuggestSuggestion ${
                  index === highlightedIndex ? "--highlighted" : ""
                }`}
                key={`${item.value}${index}`}
                {...getItemProps({ item, index })}
              >
                {item.title}
              </li>
            ))}
          </div>
        </ul>}
    </>
  );
};
