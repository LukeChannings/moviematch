import React, { useContext } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { MovieMatchContext } from "../store.ts";
import { ShareIcon } from "./ShareIcon.tsx";
import { Avatar } from "./Avatar.tsx";

import "./RoomInfoBar.css";
import { Tr } from "./Tr.tsx";

export const RoomInfoBar = () => {
  const store = useContext(MovieMatchContext);
  if (!store) {
    return null;
  }
  const handleShare = async () => {
    const shareUrl = new URL(location.origin);
    shareUrl.searchParams.set("roomName", store.room?.name ?? "");
    try {
      await navigator.share({
        text: shareUrl.href,
      });
    } catch (err) {
      console.log(`Failed to share`, err);
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
