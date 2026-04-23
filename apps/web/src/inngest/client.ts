import "server-only";
import { Inngest, EventSchemas } from "inngest";

type Events = {
  "media/probe.requested": {
    data: {
      mediaId: string;
      key: string;
      kind: "video" | "image" | "audio";
    };
  };
  "render/reel.requested": {
    data: {
      renderJobId: string;
    };
  };
};

export const inngest = new Inngest({
  id: "reelforge",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export type InngestClient = typeof inngest;
