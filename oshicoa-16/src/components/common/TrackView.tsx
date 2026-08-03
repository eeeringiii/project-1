"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/** マウント時に一度だけイベントを送るユーティリティ（サーバーページから使う）。 */
export default function TrackView({
  event,
  params,
}: {
  event: AnalyticsEvent;
  params?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}
