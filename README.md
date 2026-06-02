<div align="center">
  <h1>🤖 AI2SQL MCP Server</h1>
  <p><strong>Write SQL 10× faster — inside Claude Code</strong></p>
  <p>Generate, explain, optimize, and fix SQL queries from natural language.<br>Supports PostgreSQL, MySQL, SQL Server, Snowflake, Oracle & SQLite.</p>

  <p>
    <a href="https://www.npmjs.com/package/ai2sql-mcp">
      <img src="https://img.shields.io/npm/v/ai2sql-mcp?style=flat-square&label=npm" alt="npm version">
    </a>
    <a href="https://www.npmjs.com/package/ai2sql-mcp">
      <img src="https://img.shields.io/npm/dm/ai2sql-mcp?style=flat-square" alt="npm downloads">
    </a>
    <a href="https://github.com/mergisi/ai2sql-mcp/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/mergisi/ai2sql-mcp?style=flat-square" alt="MIT license">
    </a>
  </p>
</div>

---

## ✨ What is this?

**AI2SQL MCP** turns plain English into SQL — right inside your Claude Code terminal. No tab-switching, no Stack Overflow, no "WHERE clause syntax" rabbit holes.

```bash
# Instead of writing this yourself:
SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as revenue
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND u.status = 'active'
GROUP BY u.name
HAVING SUM(o.total) > 1000
ORDER BY revenue DESC
LIMIT 10;

# You just type: "Show me active users who spent >$1000 in the last 30 days"
# AI2SQL generates the query. You run it.
```

---

## 🚀 Quick Start (30 seconds)

Add this to your `~/.cursor/mcp.json` or Claude Code settings:

```json
{
  "mcpServers": {
    "ai2sql": {
      "command": "npx",
      "args": ["-y", "ai2sql-mcp"]
    }
  }
}
```

That's it. Restart Claude Code and you're ready.

---

## 🛠️ Tools

### `generate_sql` — Text → SQL
```markdown
> Generate a query to find top 10 customers by revenue last month
→ AI2SQL generates the perfect SQL with correct joins, aggregations, and filters
```

### `explain_sql` — What does this query do?
```markdown
> Explain this query: SELECT ... (pastes complex SQL)
→ "This query joins the users and orders tables, filters for last quarter..."
```

### `optimize_sql` — Make it faster
```markdown
> Optimize this query for PostgreSQL: SELECT * FROM orders WHERE ...
→ "Added index hints, rewrote subquery as JOIN, removed unnecessary columns"
```

### `fix_sql_error` — Debug mode
```markdown
> Fix this query: SELECT ... (broken SQL)
> Error: column "status" does not exist
→ "Added missing column reference, fixed the GROUP BY clause"
```

### `list_schemas` — Know your database (Pro)
```markdown
> Show me my database schemas
→ Returns all your saved tables, columns, and types from AI2SQL
```

---

## 🔑 Pro Features

Get unlimited queries and schema-aware generation with an API key:

```json
{
  "mcpServers": {
    "ai2sql": {
      "command": "npx",
      "args": ["-y", "ai2sql-mcp"],
      "env": {
        "AI2SQL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**How to get your API key:**
1. Sign up at [ai2sql.io](https://ai2sql.io)
2. Go to **Dashboard → API Keys**
3. Click **Generate New Key**
4. Copy and add to your config above

Without an API key you get **5 free queries per session** — enough to try it out.

---

## 🗄️ Supported Databases

| Database | Dialect Name |
|----------|-------------|
| PostgreSQL | `postgres` |
| MySQL | `mysql` |
| SQL Server | `sqlserver` |
| Snowflake | `snowflake` |
| Oracle | `oracle` |
| SQLite | `sqlite` |

---

## 💡 Use Cases

- **Data analysts** — Stop writing JOINs from memory. Describe what you need.
- **Backend developers** — Debug SQL errors without Googling error messages.
- **Database migrations** — Generate ALTER TABLE, CREATE INDEX queries in seconds.
- **Learning SQL** — See how natural language translates to real SQL queries.
- **Team onboarding** — New devs can query production databases immediately.

---

## 💻 Works With

| Platform | Setup |
|----------|-------|
| **Claude Code** | Add MCP config (see Quick Start) |
| **Cursor IDE** | Add to `~/.cursor/mcp.json` |
| **Windsurf** | Add to MCP settings |
| **Continue.dev** | Add to config.json |
| **Any MCP client** | Use `npx -y ai2sql-mcp` |

---

## 📦 Installation (alternative)

```bash
# Run directly without installing
npx -y ai2sql-mcp

# Or install globally
npm install -g ai2sql-mcp
ai2sql-mcp
```

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Claude Code     │◄───►│  ai2sql-mcp     │◄───►│  AI2SQL API  │
│  (MCP client)    │     │  (MCP server)   │     │  (cloud)     │
└─────────────────┘     └─────────────────┘     └──────────────┘
                                                       │
                                               ┌───────┴───────┐
                                               │  SQL Generator │
                                               │  AI Engine     │
                                               └───────────────┘
```

---

## 📝 Changelog

See [releases](https://github.com/mergisi/ai2sql-mcp/releases).

---

## 🤝 Contributing

PRs welcome! Check the [issues](https://github.com/mergisi/ai2sql-mcp/issues) for feature requests and bugs.

---

## 📄 License

MIT © [Mustafa Ergisi](https://ai2sql.io)

---

<div align="center">
  <p>
    <a href="https://ai2sql.io">🌐 Website</a> ·
    <a href="https://github.com/mergisi/ai2sql-mcp">📦 GitHub</a> ·
    <a href="https://www.npmjs.com/package/ai2sql-mcp">📥 npm</a> ·
    <a href="https://x.com/ergisimustafa">🐦 Twitter</a>
  </p>
  <p>⭐ Star us on GitHub — it helps other developers discover this tool!</p>
</div>
