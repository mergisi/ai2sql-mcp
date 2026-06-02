#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE = "https://builder.ai2sql.io/api";

// Detect API key from env
const API_KEY = process.env.AI2SQL_API_KEY || "";

// Free tier: 5 queries per session
const FREE_LIMIT = 5;
let freeQueryCount = 0;

async function generateSQL(text, dialect = "postgres", schema = "") {
  if (!API_KEY) {
    freeQueryCount++;
    if (freeQueryCount > FREE_LIMIT) {
      throw new Error(
        `Free tier limit reached (${FREE_LIMIT} queries per session). Get an API key for unlimited access: https://builder.ai2sql.io/dashboard/api-keys`
      );
    }
  }
  const endpoint = API_KEY
    ? `${API_BASE}/sql/generate`
    : `${API_BASE}/try-sql/generate`;

  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const body = API_KEY
    ? { text, dialect, prettify: true }
    : { query: text, mode: dialect };
  if (schema) body.schema = schema;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI2SQL API error (${res.status}): ${err}`);
  }

  return res.json();
}

async function aiChat(message) {
  const res = await fetch(`${API_BASE}/ai-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI2SQL Chat API error (${res.status}): ${err}`);
  }

  return res.json();
}

// Tools definition
const TOOLS = [
  {
    name: "generate_sql",
    description:
      "Generate a SQL query from natural language. Supports PostgreSQL, MySQL, SQL Server, Snowflake, Oracle, and SQLite.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Natural language description of the SQL query you need. Example: 'Find top 10 customers by revenue last month'",
        },
        dialect: {
          type: "string",
          enum: [
            "postgres",
            "mysql",
            "sqlserver",
            "snowflake",
            "oracle",
            "sqlite",
            "standard",
          ],
          description: "SQL dialect to generate for. Defaults to postgres.",
          default: "postgres",
        },
        schema: {
          type: "string",
          description:
            "Optional database schema context. Format: 'table1:col1(type),col2(type);table2:col1(type)'. Providing schema improves accuracy.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "explain_sql",
    description:
      "Explain what a SQL query does in plain English. Breaks down each part of the query.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "The SQL query to explain.",
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "optimize_sql",
    description:
      "Analyze a SQL query for performance issues and suggest optimizations. Returns improved query with explanations.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "The SQL query to optimize.",
        },
        dialect: {
          type: "string",
          enum: [
            "postgres",
            "mysql",
            "sqlserver",
            "snowflake",
            "oracle",
            "sqlite",
          ],
          description: "SQL dialect for dialect-specific optimizations.",
          default: "postgres",
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "fix_sql_error",
    description:
      "Fix a SQL query based on an error message. Provide the broken query and the error, get back a corrected version.",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "The SQL query that produced an error.",
        },
        error: {
          type: "string",
          description: "The error message from the database.",
        },
        dialect: {
          type: "string",
          enum: [
            "postgres",
            "mysql",
            "sqlserver",
            "snowflake",
            "oracle",
            "sqlite",
          ],
          description: "SQL dialect of the database.",
          default: "postgres",
        },
      },
      required: ["sql", "error"],
    },
  },
  {
    name: "list_schemas",
    description:
      "List your saved database schemas from AI2SQL. Shows all tables and columns in your connected databases. Requires a Pro API key.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Create server
const server = new Server(
  {
    name: "ai2sql",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_sql": {
        const result = await generateSQL(
          args.query,
          args.dialect || "postgres",
          args.schema || ""
        );
        const remaining = FREE_LIMIT - freeQueryCount;
        const content = [
          {
            type: "text",
            text: `**Generated SQL (${args.dialect || "postgres"}):**\n\`\`\`sql\n${result.sql}\n\`\`\``,
          },
        ];
        if (!API_KEY) {
          content.push({
            type: "text",
            text: `[Free tier: ${remaining}/${FREE_LIMIT} queries remaining] Get unlimited queries with a Pro API key: https://builder.ai2sql.io/dashboard/api-keys`,
          });
        }
        return { content };
      }

      case "explain_sql": {
        const result = await aiChat(
          `Explain this SQL query in plain English. Break down each part:\n\n${args.sql}`
        );
        return {
          content: [
            {
              type: "text",
              text: result.message || result.response || JSON.stringify(result),
            },
          ],
        };
      }

      case "optimize_sql": {
        const dialect = args.dialect || "postgres";
        const result = await aiChat(
          `Optimize this ${dialect} SQL query for performance. Show the improved query and explain what you changed:\n\n${args.sql}`
        );
        return {
          content: [
            {
              type: "text",
              text: result.message || result.response || JSON.stringify(result),
            },
          ],
        };
      }

      case "fix_sql_error": {
        const dialect = args.dialect || "postgres";
        const result = await aiChat(
          `Fix this ${dialect} SQL query. The error is: "${args.error}"\n\nQuery:\n${args.sql}\n\nProvide the corrected query and explain what was wrong.`
        );
        return {
          content: [
            {
              type: "text",
              text: result.message || result.response || JSON.stringify(result),
            },
          ],
        };
      }

      case "list_schemas": {
        if (!API_KEY) {
          return {
            content: [
              {
                type: "text",
                text: "This feature requires a Pro API key. Get one at: https://builder.ai2sql.io/dashboard/api-keys",
              },
            ],
          };
        }

        const res = await fetch(`${API_BASE}/sql/schemas`, {
          headers: { "X-API-Key": API_KEY },
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`AI2SQL API error (${res.status}): ${err}`);
        }

        const schemas = await res.json();

        if (!schemas.length) {
          return {
            content: [
              {
                type: "text",
                text: "No database schemas saved yet. Connect your database at https://builder.ai2sql.io/dashboard/databases-setup to save your schema.",
              },
            ],
          };
        }

        const formatted = schemas
          .map((s) => {
            const cols = s.columns
              .map((c) => `  ${c.name} (${c.type})${c.constraints ? ' ' + c.constraints : ''}`)
              .join("\n");
            return `**${s.table_name}** (id: ${s.id})\n\`\`\`\n${cols}\n\`\`\``;
          })
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `**Your Database Tables (${schemas.length}):**\n\n${formatted}\n\nProvide these table/column names in the schema parameter of generate_sql for accurate queries.`,
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
