---
name: livekit-webrtc-meetings
description: 'Implementation patterns for LiveKit WebRTC video rooms, token authentication, participant turn queues, agenda point deliberative voting, and room state management in NestJS and Next.js.'
---

# LiveKit WebRTC Video Conferencing & Deliberation Architecture

## 1. Overview
The Meetings module integrates LiveKit Cloud / Server SDK for real-time video, audio, and screen sharing, combined with deliberative governance tools (speaker queues and agenda voting).

## 2. Backend Token Generation
The backend exposes `POST /meetings/:id/token` using `@livekit/server-sdk`:

```typescript
import { AccessToken } from 'livekit-server-sdk';

export async function generateMeetingToken(meetingId: string, user: { id: string; name: string }) {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: user.id,
      name: user.name,
      ttl: '4h',
    }
  );

  at.addGrant({
    roomJoin: true,
    room: `meeting-${meetingId}`,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
}
```

## 3. Deliberative Agenda Voting Protocol
Each meeting supports formal deliberation:
1. **Agenda Points**: Pre-configured or proposed during session (`title`, `description`, `status: OPEN | CLOSED`).
2. **Vote Options**: `POUR` (In favor), `CONTRE` (Against), `ABSTENTION`.
3. **Auditability**: Every vote is recorded with participant identity, timestamp, and immutable snapshot.
4. **Instant Quorum**: Real-time tally displayed to participants once the vote closes.

## 4. Participant Speaker Turn Queue
- Participants invoke `POST /meetings/:id/turns` to request a turn (Raise Hand).
- Moderators receive instant notification and can approve (`GRANT`), dismiss, or mute.
- Current active speaker is prominently displayed on the video grid with an ochre badge (`#CCA43B`).

## 5. Frontend Video Room UI (`/community/meetings/[id]`)
- Integrated with `@livekit/components-react`.
- Palette compliance:
  - Room container background: `#242F40` (Navy)
  - Control bar background: `#363636` (Charcoal)
  - Active speaker / Raised hand highlight: `#CCA43B` (Ochre)
  - Text & active icons: `#FFFFFF`
- Responsive layout: video grid automatically adjusts columns based on active participant count.
