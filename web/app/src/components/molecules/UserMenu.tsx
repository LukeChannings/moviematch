import React, { useEffect, useState } from "react";
import { usePopper } from "react-popper";
import { useDispatch } from "react-redux";
import { Dispatch, useStore } from "../../store";
import { Avatar } from "../atoms/Avatar";
import { ExpandIcon } from "../atoms/ExpandIcon";
import { MenuButton } from "../atoms/MenuButton";
import { MenuGroup } from "../atoms/MenuGroup";
import { Popover } from "../atoms/Popover";

import styles from "./UserMenu.module.css";
import { UserProgressItem } from "./UserProgressItem";

export const UserMenu = () => {
  const [{ user, room }] = useStore(["user", "room"]);
  const dispatch = useDispatch<Dispatch>();
  const [referenceEl, setReferenceEl] = useState<HTMLDivElement | null>();
  const [popperEl, setPopperEl] = useState<HTMLDivElement | null>();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (popperEl?.contains(e.target) || referenceEl?.contains(e.target))
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mouseup", handleOutsideClick);
    return () => {
      document.removeEventListener("mouseup", handleOutsideClick);
    };
  }, [referenceEl, popperEl]);

  const popper = usePopper(referenceEl, popperEl, {
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 10],
        },
      },
      {
        name: "preventOverflow",
        options: {
          padding: 8,
        },
      },
    ],
  });

  useEffect(() => {
    setTimeout(() => {
      popper.forceUpdate && popper.forceUpdate();
    }, 10);
  }, [isOpen]);

  if (!user) return null;

  return (
    <>
      <div
        className={styles.user}
        ref={setReferenceEl}
        role="button"
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        <ExpandIcon />
        {user && (
          <>
            <Avatar userName={user.userName} avatarUrl={user.avatarImage} />
            <p className={styles.userName}>{user.userName}</p>
          </>
        )}
      </div>
      <Popover
        isOpen={isOpen}
        ref={setPopperEl}
        {...popper.attributes.popper}
        style={popper.styles.popper}
        arrowProps={popper.attributes.arrow}
        arrowStyles={popper.styles.arrow}
      >
        <UserProgressItem key={user.userName} user={user} progress={0} />
        <MenuGroup title="Also in the room:">
          {room?.users && room?.users?.length > 1 && (
            <div className={styles.usersList}>
              {room.users.map((userProgress) => {
                if (userProgress.user.userName === user.userName) {
                  return null;
                }
                return <UserProgressItem
                  key={userProgress.user.userName}
                  {...userProgress}
                />;
              })}
            </div>
          )}
        </MenuGroup>
        <MenuButton onClick={() => dispatch({ type: "leaveRoom" })}>
          Leave Room
        </MenuButton>
        <MenuButton onClick={() => dispatch({ type: "logout" })}>
          Logout
        </MenuButton>
      </Popover>
    </>
  );
};
