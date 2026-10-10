---
name: query-database
description: Answer questions about the user's own database with the AI2SQL MCP server. Use when the user asks about their data (counts, revenue, users, orders, trends) or wants SQL written, fixed, optimized, explained or converted for PostgreSQL, MySQL or SQL Server.
---

# Query a database with AI2SQL

## When to use

- The user asks a question about data in a database they connected at ai2sql.io
- The user wants SQL written, fixed, optimized, explained or converted between dialects

## Instructions

1. Call `list_connections` to see which databases the user has connected. If there are none, tell them to connect one at https://builder.ai2sql.io and stop.
2. Call `describe_schema` for the right connection before writing any SQL, so table and column names come from the real schema. Never guess column names.
3. Write the query with `generate_sql`, or by hand from the schema. Use the connection's dialect (`LIMIT` on PostgreSQL and MySQL, `TOP` on SQL Server).
4. Run it with `run_query`. It is read-only: one `SELECT` or `WITH` statement, up to 1,000 rows and 10 seconds. Do not try writes or DDL; the gateway rejects them.
5. Show the SQL you ran, then answer the question in plain language from the rows returned.
6. If a query fails, pass the SQL and the error to `fix_sql` and run the fixed query once.
7. For SQL the user pasted, use `explain_sql`, `optimize_sql` or `convert_sql` as asked.

If a tool returns `plan_limit_reached` or `payment_required`, tell the user plainly and stop. Do not retry.
