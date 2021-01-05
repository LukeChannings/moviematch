import React, {
  useCallback,
  useContext,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { MovieMatchContext } from "../store.ts";
import { ShareIcon } from "./ShareIcon.tsx";

import "./RoomInfoBar.css";

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
        url: shareUrl.href,
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="RoomInfoBar">
      <div className="RoomInfoBar_User">
        <img
          className="RoomInfoBar_UserAvatar"
          src={store.user?.avatar}
          alt={`${store.user?.userName}'s picture`}
        />
        <p className="RoomInfoBar_UserName">{store.user?.userName}</p>
      </div>
      <div className="RoomInfoBar_MatchCount">
        <p className="RoomInfoBar_MatchCount_Count">
          {(store.room?.matches ?? []).length}
        </p>
        <p className="RoomInfoBar_MatchCount_Title">Matches</p>
      </div>
      <button className="RoomInfoBar_ShareRoomButton" onClick={handleShare}>
        {store.room?.name}
        <ShareIcon />
      </button>
    </div>
  );
};
