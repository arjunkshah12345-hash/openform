# Openform build

Objective: Ship a self-hostable conversational form builder.
Nodes: Shared data contract → [SQLite API + API tests || React workspace + editor + respondent flow] → integration → build + browser verification → fixes until passing.
Edges: src/types.ts defines frontend/API data shapes; client requests consume API output; verification consumes running integrated app.
Stop condition: create, edit, publish, submit, inspect/export responses, persistence, responsive UI, production build pass.
