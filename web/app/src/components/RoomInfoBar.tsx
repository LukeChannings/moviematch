import React, { useContext } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { MovieMatchContext } from "../store.ts";
import { ShareIcon } from "./ShareIcon.tsx";
import { Avatar } from "./Avatar.tsx";

import "./RoomInfoBar.css";
import { Tr } from "./Tr.tsx";
import { Toast } from "./Toast.tsx";
import { Popover, PopoverButton, PopoverMenuButton } from "./Popover.tsx";
import { Button } from "./Button.tsx";

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
  const store = useContext(MovieMatchContext);
  if (!store) {
    return null;
  }
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
    <div className="RoomInfoBar">
      <div className="RoomInfoBar_Item">
        {store.user && (
          <PopoverButton className="RoomInfoBar_User">
            {(isPopoverOpen) => (
              <>
                <Avatar
                  userName={store.user!.userName}
                  avatarUrl={store.user!.avatar}
                />
                <p className="RoomInfoBar_User_UserName">
                  {store.user!.userName}
                </p>
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
      <div className="RoomInfoBar_MatchCount">
        <p className="RoomInfoBar_MatchCount_Count">
          {(store.room?.matches ?? []).length}
        </p>
        <p className="RoomInfoBar_MatchCount_Title">
          <Tr name="MATCHES_SECTION_TITLE" />
        </p>
      </div>
      <div className="RoomInfoBar_Item">
        <button className="RoomInfoBar_ShareRoomButton" onClick={handleShare}>
          {store.room?.name}
          <ShareIcon />
        </button>
      </div>
    </div>
  );
};
