import React from "react";
import { ShareIcon } from "../atoms/ShareIcon";
import { ExpandIcon } from "../atoms/ExpandIcon";
import { Avatar } from "../atoms/Avatar";
import { Tr } from "../atoms/Tr";
import type { Toast } from "../atoms/Toast";
import { Popover, PopoverButton, PopoverMenuButton } from "../atoms/Popover";

import styles from "./RoomInfoBar.module.css";
import { useStore } from "../../store";

interface RoomInfoBarProps {
  logout: () => void;
  leaveRoom: () => void;
  addToast: (toast: Toast) => void;
}

export const RoomInfoBar = ({
  addToast,
  logout,
  leaveRoom,
}: RoomInfoBarProps) => {
  const [store] = useStore(["room", "translations", "user"]);

  const handleShare = async () => {
    const shareUrl = new URL(location.origin);
    shareUrl.searchParams.set("roomName", store.room?.name ?? "");
    try {
      await navigator.clipboard.writeText(shareUrl.href);
      addToast({
        id: Date.now(),
        showTimeMs: 2_000,
        message: store.translations?.COPY_LINK_SUCCESS ?? "COPY_LINK_SUCCESS",
        appearance: "Success",
      });
    } catch (err) {
      addToast({
        id: Date.now(),
        showTimeMs: 2_000,
        message: store.translations?.COPY_LINK_FAILURE ?? "COPY_LINK_FAILURE",
        appearance: "Failure",
      });
    }
  };
  return (
    <div className={styles.infoBar}>
      <div className={styles.item}>
        {store.user && (
          <PopoverButton className={styles.user}>
            {(isPopoverOpen) => (
              <>
                <ExpandIcon />
                {store.user && (
                  <>
                    <Avatar
                      userName={store.user.userName}
                      avatarUrl={store.user.avatarImage}
                    />
                    <p className={styles.userName}>
                      {store.user.userName}
                    </p>
                  </>
                )}
                {isPopoverOpen && (
                  <Popover>
                    <PopoverMenuButton onPress={leaveRoom}>
                      Leave Room
                    </PopoverMenuButton>
                    <PopoverMenuButton onPress={logout}>
                      Sign out
                    </PopoverMenuButton>
                  </Popover>
                )}
              </>
            )}
          </PopoverButton>
        )}
      </div>
      <div className={styles.matchCountWrapper}>
        <p className={styles.matchCount}>
          {(store.room?.matches ?? []).length}
        </p>
        <p className={styles.matchCountTitle}>
          <Tr name="MATCHES_SECTION_TITLE" />
        </p>
      </div>
      <div className={styles.item}>
        <button className={styles.shareButton} onClick={handleShare}>
          {store.room?.name}
          <ShareIcon size="1.5rem" />
        </button>
      </div>
    </div>
  );
};
