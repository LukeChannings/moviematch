import React, { useContext } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { MovieMatchContext } from "../store.ts";
import { ShareIcon } from "./ShareIcon.tsx";
import { Avatar } from "./Avatar.tsx";

import "./RoomInfoBar.css";
import { Tr } from "./Tr.tsx";
import { Toast } from "./Toast.tsx";

interface RoomInfoBarProps {
  addToast: (toast: Toast) => void;
}

export const RoomInfoBar = ({ addToast }: RoomInfoBarProps) => {
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
      {store.user && (
        <div className="RoomInfoBar_User">
          <Avatar
            userName={store.user.userName}
            avatarUrl={store.user.avatar}
          />
          <p className="RoomInfoBar_User_UserName">{store.user.userName}</p>
        </div>
      )}
      <div className="RoomInfoBar_MatchCount">
        <p className="RoomInfoBar_MatchCount_Count">
          {(store.room?.matches ?? []).length}
        </p>
        <p className="RoomInfoBar_MatchCount_Title">
          <Tr name="MATCHES_SECTION_TITLE" />
        </p>
      </div>
      <button className="RoomInfoBar_ShareRoomButton" onClick={handleShare}>
        {store.room?.name}
        <ShareIcon />
      </button>
    </div>
  );
};
