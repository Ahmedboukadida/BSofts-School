# 📦 ARCHIVED DOMAINS KNOWLEDGE VAULT

This document preserves the complete knowledge, model definitions, DTO contracts, and architectural specs of non-core BSOFT domains (`blog`, `marketing`, `misc`, `projects`, `support`) that have been muted from active runtime.

---

## 1. 📝 Blog Domain (`blog_*`)
- **`blog_posts`**: Title, slug, content, excerpt, featured_image, category_id, author_id, status (DRAFT, PUBLISHED, ARCHIVED), published_at.
- **`blog_categories`**: Name, slug, description, parent_id.
- **`blog_tags`**: Name, slug.
- **`blog_comments`**: Post_id, author_name, author_email, content, status (PENDING, APPROVED, SPAM).

---

## 2. 📢 Marketing Domain (`marketing_*`)
- **`email_campaigns`**: Subject, template_id, target_segment, status (DRAFT, SCHEDULED, SENT), sent_at, open_rate, click_rate.
- **`campaign_subscribers`**: Email, firstname, lastname, tags, status (SUBSCRIBED, UNSUBSCRIBED).
- **`newsletters`**: Title, body, send_date.

---

## 3. 🎫 Support Domain (`support_*`)
- **`supports_tickets`**: Reference, subject, description, priority (LOW, MEDIUM, HIGH, URGENT), status (OPEN, IN_PROGRESS, RESOLVED, CLOSED), client_id, agent_id.
- **`supports_tickets_lines`**: Ticket_id, sender_type (CLIENT, AGENT), message, attachments.
- **`supports_tickets_files`**: Ticket_id, file_path, file_type.
- **`faq_articles`**: Question, answer, category_id, views_count.
- **`faq_categories`**: Name, description.
- **`live_chat_sessions`**: Session_token, client_id, agent_id, status, started_at, ended_at.

---

## 4. 📁 Projects Domain (`projects_*`)
- **`projects`**: Name, code, description, client_id, start_date, end_date, status (PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED), budget.
- **`project_tasks`**: Project_id, title, description, assigned_to, status, priority, estimated_hours, logged_hours.
- **`project_milestones`**: Project_id, title, due_date, status.
- **`project_time_logs`**: Task_id, user_id, hours, description, logged_at.

---

## 5. 🧩 Misc Domain (`misc_*`)
- Auxiliary feedback widgets, temporary token caches, and legacy placeholder tables.
