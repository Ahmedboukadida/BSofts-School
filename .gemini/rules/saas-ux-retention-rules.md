# SaaS UX Retention & Interaction Design Rules

These rules must be followed across all SaaS feature development, UI design, component building, and workflow implementations in BSofts. Increasing retention reduces user churn and continuously reveals value over time.

---

## Rule 01: Empty States That Teach
An empty state or zero-data view must **never** look blank, simple, or dead. It must explain what the user can do next and guide them to value.
- **Clear Explanation**: State why this view is empty and what benefit populating it brings.
- **One Primary Action**: Provide an un-missable primary CTA button (e.g., "Create Your First Invoice").
- **Realistic Sample Data / Preview**: Show a realistic example, skeleton preview, or template preview so users visualize the end outcome.

---

## Rule 02: Progressive Feature Discovery
Avoid overwhelming users by exposing every advanced control at once on day one.
- **Contextual Unlocking**: Introduce advanced tools only when relevant to the user's current step or behavior.
- **Reduce Cognitive Load**: Keep primary flows focused; place secondary/power-user options behind contextual disclosure (collapsible accordion, drawer tabs, or contextual tooltips).
- **Behavioral Guidance**: Trigger contextual tips and onboarding badges based on user action rather than arbitrary time delays.

---

## Rule 03: Persistent Progress Indicators
Users should always have visual clarity on where they stand and what steps remain to achieve success.
- **Visibility of Completion**: Implement setup checklists, profile completion meters, onboarding step indicators, and workspace health scores.
- **Value Motivation**: Show remaining steps with clear estimates (e.g. *"2 of 5 setup steps complete (3 min remaining)"*). Progress motivates completion and retention.

---

## Rule 04: Contextual Help Instead of Documentation
Never force users to leave the interface or open external documentation tabs to understand a feature.
- **Inline Explanations**: Provide clear micro-copy directly below complex fields.
- **Hover Tooltips & Walkthroughs**: Use rich tooltips (<kbd>Info</kbd> icons) and contextual walkthrough drawers for complex workflows.
- **Command Palette & AI Assistance**: Ensure key actions and help topics are searchable via `<KBD>Ctrl + K</KBD>` command palette or instant AI help.

---

## Rule 05: Smart Success Feedback
After a user completes an important action, reinforce the business value created rather than displaying generic static text like *"Saved"*.
- **Reinforce Business Outcome**: 
  - Instead of *"Saved"*, use: *"Invoice sent successfully. Payment tracking is now active."*
  - Instead of *"Subscription Created"*, use: *"Subscription activated successfully. Module access and automated billing schedules are now live."*
- **Confirm & Highlight Value**: Every toast or banner must confirm the immediate outcome and highlight the value created for the user's business.

---

## Key Takeaway
Great SaaS UX isn't just about modern visuals — it's about making users repeatedly successful. The products people keep paying for continuously reduce friction, reveal value at the right moment, and build confidence through thoughtful interaction design.
