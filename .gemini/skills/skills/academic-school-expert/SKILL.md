---
name: academic-school-expert
description: Expert in Academic LMS, School Management, GPA & Class Ranking, Timetabling Collision Algorithms, and Student Bulletins from EasySchool.
---

# Academic School Expert Skill

Governs academic domain logic within BSOFTS:
- Hierarchy: `School` -> `Cycle` -> `Level` -> `Class` -> `Student`
- Timetabling Collision Check: `(Slot1_Start < Slot2_End) AND (Slot1_End > Slot2_Start)` for same Teacher/Room/Class
- Weighted Grade: `Grade * Subject_Coefficient`
- General Term Average: `Σ(Grade * Coeff) / Σ(Coeff)`
- Class Rank: Dense ranking by General Average descending
