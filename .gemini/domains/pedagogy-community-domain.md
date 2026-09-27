# Domain 3: Pedagogy, Evaluation & Community

## 1. Domain Purpose
This domain drives day-to-day academic execution, student engagement, assessments, real-time collaboration, and campus communications. It powers virtual classrooms via LiveKit WebRTC, deliberative assembly voting, homework cycles, examinations, and instant messaging.

## 2. Core Entities & Data Models
- **`Homework` & `HomeworkSubmission`**: Teacher assignments, file attachments, due dates, student submissions, and grading feedback.
- **`Exam` & `ExamGrade`**: Formal tests, evaluations, coefficients, minimum passing marks, and grade recording.
- **`StudentAttendance`**: Daily or hourly attendance sessions capturing attendance statuses (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
- **`Meeting`**: Video conference session integrated with LiveKit WebRTC.
- **`MeetingPoint` & `MeetingVote`**: Formal agenda points submitted for deliberative voting with real-time tally (`POUR`, `CONTRE`, `ABSTENTION`).
- **`MeetingTurn`**: Speaker queue management allowing participants to raise hands and request speaking turns.
- **`Conversation` & `Message`**: Internal chat channels (one-on-one and group discussions).
- **`Notification`**: Real-time push and in-app alerts dispatched across WebSocket and database channels.

## 3. Key Endpoints & APIs
- `GET /homework` & `POST /homework`: Assignment posting and collection.
- `GET /exams` & `POST /exams`: Examination scheduling and coefficient assignments.
- `GET /student-attendance` & `POST /student-attendance`: Roll-call logging and historical attendance statistics.
- `POST /meetings`: Schedule a virtual meeting room.
- `POST /meetings/:id/token`: Generate a secure LiveKit WebRTC access token for an authenticated user.
- `POST /meetings/:id/points/:pointId/vote`: Cast a vote on an agenda point with instant result computation.
- `POST /meetings/:id/turns`: Request or release a speaking turn in the participant queue.
- `GET /conversations` & `POST /conversations/:id/messages`: Message exchange.
- `GET /notifications` & `PATCH /notifications/:id/read`: Notification alert feeds.

## 4. Frontend Views
- `/homework`: Homework assignment board with due date badges and submission modal.
- `/exams`: Examination registry with subject coefficients and class average indicators.
- `/attendance`: Interactive attendance sheet with quick-toggle status buttons.
- `/community/meetings`: Virtual conference directory with room join links and participant lists.
- `/community/meetings/[id]`: Fully integrated WebRTC video room powered by LiveKit with video grid, live chat, agenda voting drawer, and turn request management.
- `/community/messages`: Real-time chat interface with contact list and chat history.
- `/community/notifications`: Notification center with unread counters and batch mark-as-read actions.

## 5. Architectural Safeguards
- WebRTC video rooms enforce strict authentication tokens with dynamic expiry times.
- Silent catch elimination: all message sends, notification reads, and meeting operations emit user toasts on failure (`showApiErrorToast`).
- Soft-delete support on homework and exams with trash bin recovery.
