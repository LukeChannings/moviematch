import React, { useEffect, useState } from "react";
import { useCombobox, useMultipleSelection } from "downshift";
import { usePopper } from "react-popper";

import type { FilterValue } from "../../../../../types/moviematch";
import { Pill } from "../atoms/Pill";

import styles from "./AutoSuggestInput.module.css";

interface AutoSuggestInputProps {
  inputName: string;
  items: FilterValue[];
  value: FilterValue[];
  onChange: (value: FilterValue[]) => void;
}

export const AutoSuggestInput = ({
  inputName,
  items,
  onChange,
  value,
}: AutoSuggestInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ defaultSelectedItems: value });
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<HTMLDivElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>();

  const { styles: popperStyles, attributes, update: updatePopper } = usePopper(
    referenceElement,
    popperElement,
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
    stateReducer: (_state, actionAndChanges) => {
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
            if (updatePopper) {
              updatePopper();
            }
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

  return (
    <>
      <div {...getComboboxProps()} className={styles.container}>
        <div className={styles.selections}>
          {selectedItems.map((selectedItem, index) => (
            <>
              {index !== 0 && (
                <span className={styles.selectionsDelimiterLabel}>
                  or
                </span>
              )}
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
          <input
            className={styles.input}
            name={inputName}
            {...inputProps}
            ref={(el) => {
              setReferenceElement(el);
              inputProps.ref(el);
            }}
            onFocus={() => {
              if (!isOpen) {
                openMenu();
              }
            }}
            data-test-handle={inputName + "-autosuggest-input"}
          />
        </div>
      </div>
      {isOpen && filteredItems.length !== 0 && (
        <ul
          {...menuProps}
          ref={(menuEl) => {
            if (menuEl) {
              setPopperElement(menuEl);
              menuProps.ref(menuEl);
            }
          }}
          style={popperStyles.popper}
          {...attributes.popper}
          className={styles.suggestions}
        >
          <div
            data-popper-arrow
            className={styles.suggestionsArrow}
            style={popperStyles.arrow}
            {...attributes.arrow}
          >
          </div>
          <div
            className={styles.suggestionsScrollBox}
            data-test-handle={inputName + "-suggestions"}
          >
            {getFilteredItems().map((item, index) => (
              <li
                className={index === highlightedIndex
                  ? styles.highlightedSuggestion
                  : styles.suggestion}
                key={`${item.value}${index}`}
                data-test-handle={`${inputName}-suggestion-${item.title}`}
                {...getItemProps({ item, index })}
              >
                {item.title}
              </li>
            ))}
          </div>
        </ul>
      )}
    </>
  );
};
