/**
 * BitcoinBaby Workers - Main Entry Point
 *
 * Cloudflare Workers API for:
 * - Virtual balance management
 * - Withdrawal pool batching
 * - Game state synchronization
 *
 * 100% FREE on Cloudflare Workers (free tier)
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env, ApiResponse, PoolType } from "./lib/types";

// Re-export Durable Objects
export { VirtualBalanceDO } from "./durable-objects/virtual-balance";
export { WithdrawPoolDO } from "./durable-objects/withdraw-pool";
export { GameRoomDO } from "./durable-objects/game-room";

// Create Hono app with typed env
const app = new Hono<{ Bindings: Env }>();

// =============================================================================
// MIDDLEWARE
// =============================================================================

// CORS for frontend
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://bitcoinbaby.app",
      "https://*.bitcoinbaby.app",
      "https://bitcoinbaby.vercel.app",
      "https://*.vercel.app",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Request-Id"],
    maxAge: 86400,
    credentials: true,
  }),
);

// Request logging
app.use("*", logger());

// Request ID middleware
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  c.header("X-Request-Id", requestId);
  await next();
});

// =============================================================================
// HEALTH & STATUS
// =============================================================================

app.get("/", (c) => {
  return c.json({
    name: "BitcoinBaby API",
    version: "1.0.0",
    status: "healthy",
    timestamp: Date.now(),
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    environment: c.env.ENVIRONMENT,
    timestamp: Date.now(),
  });
});

// =============================================================================
// BALANCE API
// =============================================================================

/**
 * GET /api/balance/:address - Get user's virtual balance
 */
app.get("/api/balance/:address", async (c) => {
  const address = c.req.param("address");

  if (!address || !isValidBitcoinAddress(address)) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: "Invalid Bitcoin address",
        timestamp: Date.now(),
      },
      400,
    );
  }

  const id = c.env.VIRTUAL_BALANCE.idFromName(address);
  const stub = c.env.VIRTUAL_BALANCE.get(id);

  const response = await stub.fetch(
    new Request(`http://internal/balance/${address}/get`),
  );

  return response;
});

/**
 * POST /api/balance/:address/credit - Credit mining reward
 */
app.post("/api/balance/:address/credit", async (c) => {
  const address = c.req.param("address");

  if (!address || !isValidBitcoinAddress(address)) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: "Invalid Bitcoin address",
        timestamp: Date.now(),
      },
      400,
    );
  }

  const body = await c.req.json();
  const id = c.env.VIRTUAL_BALANCE.idFromName(address);
  const stub = c.env.VIRTUAL_BALANCE.get(id);

  const response = await stub.fetch(
    new Request(`http://internal/balance/${address}/credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

  return response;
});

// =============================================================================
// WITHDRAW POOL API
// =============================================================================

/**
 * GET /api/pool/:poolType/status - Get pool status
 */
app.get("/api/pool/:poolType/status", async (c) => {
  const poolType = c.req.param("poolType") as PoolType;

  if (!isValidPoolType(poolType)) {
    return c.json<ApiResponse>(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400,
    );
  }

  const id = c.env.WITHDRAW_POOL.idFromName(poolType);
  const stub = c.env.WITHDRAW_POOL.get(id);

  const response = await stub.fetch(
    new Request(`http://internal/pool/${poolType}/status`),
  );

  return response;
});

/**
 * GET /api/pool/:poolType/requests - Get pending requests for a pool
 */
app.get("/api/pool/:poolType/requests", async (c) => {
  const poolType = c.req.param("poolType") as PoolType;

  if (!isValidPoolType(poolType)) {
    return c.json<ApiResponse>(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400,
    );
  }

  const id = c.env.WITHDRAW_POOL.idFromName(poolType);
  const stub = c.env.WITHDRAW_POOL.get(id);

  const response = await stub.fetch(
    new Request(`http://internal/pool/${poolType}/requests`),
  );

  return response;
});

/**
 * POST /api/pool/:poolType/request - Create withdrawal request
 */
app.post("/api/pool/:poolType/request", async (c) => {
  const poolType = c.req.param("poolType") as PoolType;

  if (!isValidPoolType(poolType)) {
    return c.json<ApiResponse>(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400,
    );
  }

  const body = await c.req.json();

  // Validate required fields
  if (!body.fromAddress || !body.toAddress || !body.amount) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: "Missing required fields: fromAddress, toAddress, amount",
        timestamp: Date.now(),
      },
      400,
    );
  }

  // Reserve balance first
  const balanceId = c.env.VIRTUAL_BALANCE.idFromName(body.fromAddress);
  const balanceStub = c.env.VIRTUAL_BALANCE.get(balanceId);

  const requestId = crypto.randomUUID();
  const reserveResponse = await balanceStub.fetch(
    new Request(`http://internal/balance/${body.fromAddress}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: body.amount,
        requestId,
      }),
    }),
  );

  if (!reserveResponse.ok) {
    return reserveResponse;
  }

  // Create withdrawal request in pool
  const poolId = c.env.WITHDRAW_POOL.idFromName(poolType);
  const poolStub = c.env.WITHDRAW_POOL.get(poolId);

  const response = await poolStub.fetch(
    new Request(`http://internal/pool/${poolType}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        requestId,
      }),
    }),
  );

  return response;
});

/**
 * POST /api/pool/:poolType/cancel - Cancel withdrawal request
 */
app.post("/api/pool/:poolType/cancel", async (c) => {
  const poolType = c.req.param("poolType") as PoolType;

  if (!isValidPoolType(poolType)) {
    return c.json<ApiResponse>(
      { success: false, error: "Invalid pool type", timestamp: Date.now() },
      400,
    );
  }

  const body = await c.req.json();

  if (!body.requestId || !body.fromAddress) {
    return c.json<ApiResponse>(
      {
        success: false,
        error: "Missing required fields: requestId, fromAddress",
        timestamp: Date.now(),
      },
      400,
    );
  }

  // Cancel in pool first
  const poolId = c.env.WITHDRAW_POOL.idFromName(poolType);
  const poolStub = c.env.WITHDRAW_POOL.get(poolId);

  const poolResponse = await poolStub.fetch(
    new Request(`http://internal/pool/${poolType}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: body.requestId }),
    }),
  );

  if (!poolResponse.ok) {
    return poolResponse;
  }

  const poolData = (await poolResponse.json()) as ApiResponse<{
    cancelledAmount: string;
  }>;

  // Release balance
  const balanceId = c.env.VIRTUAL_BALANCE.idFromName(body.fromAddress);
  const balanceStub = c.env.VIRTUAL_BALANCE.get(balanceId);

  const response = await balanceStub.fetch(
    new Request(`http://internal/balance/${body.fromAddress}/cancel-withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: poolData.data?.cancelledAmount,
        requestId: body.requestId,
      }),
    }),
  );

  return response;
});

// =============================================================================
// GAME ROOM API (WebSocket)
// =============================================================================

/**
 * GET /api/game/:roomId - WebSocket connection for game state sync
 */
app.get("/api/game/:roomId", async (c) => {
  const roomId = c.req.param("roomId");
  const upgradeHeader = c.req.header("Upgrade");

  if (upgradeHeader !== "websocket") {
    return c.json<ApiResponse>(
      {
        success: false,
        error: "Expected WebSocket connection",
        timestamp: Date.now(),
      },
      426,
    );
  }

  const id = c.env.GAME_ROOM.idFromName(roomId);
  const stub = c.env.GAME_ROOM.get(id);

  return stub.fetch(c.req.raw);
});

/**
 * GET /api/game/:roomId/state - Get current game state (HTTP)
 */
app.get("/api/game/:roomId/state", async (c) => {
  const roomId = c.req.param("roomId");

  const id = c.env.GAME_ROOM.idFromName(roomId);
  const stub = c.env.GAME_ROOM.get(id);

  const response = await stub.fetch(
    new Request(`http://internal/game/${roomId}/state`),
  );

  return response;
});

// =============================================================================
// SCHEDULED TASKS (Cron)
// =============================================================================

async function handleScheduled(event: ScheduledEvent, env: Env): Promise<void> {
  const hour = new Date(event.scheduledTime).getUTCHours();
  const dayOfWeek = new Date(event.scheduledTime).getUTCDay();
  const dayOfMonth = new Date(event.scheduledTime).getUTCDate();

  console.log(
    `[Scheduled] Running at hour=${hour}, dayOfWeek=${dayOfWeek}, dayOfMonth=${dayOfMonth}`,
  );

  // Weekly pool - Sunday at midnight
  if (dayOfWeek === 0 && hour === 0) {
    console.log("[Scheduled] Processing weekly pool...");
    const id = env.WITHDRAW_POOL.idFromName("weekly");
    const stub = env.WITHDRAW_POOL.get(id);
    await stub.fetch(
      new Request("http://internal/pool/weekly/process", { method: "POST" }),
    );
  }

  // Monthly pool - 1st of month at midnight
  if (dayOfMonth === 1 && hour === 0) {
    console.log("[Scheduled] Processing monthly pool...");
    const id = env.WITHDRAW_POOL.idFromName("monthly");
    const stub = env.WITHDRAW_POOL.get(id);
    await stub.fetch(
      new Request("http://internal/pool/monthly/process", { method: "POST" }),
    );
  }

  // Low-fee check - every 6 hours
  if (hour % 6 === 0) {
    console.log("[Scheduled] Checking low-fee opportunities...");
    const id = env.WITHDRAW_POOL.idFromName("low_fee");
    const stub = env.WITHDRAW_POOL.get(id);

    // Get current fee rate from mempool.space
    try {
      const feeResponse = await fetch(
        "https://mempool.space/testnet4/api/v1/fees/recommended",
      );
      const fees = (await feeResponse.json()) as { hourFee: number };
      const maxFee = parseInt(env.MAX_FEE_RATE_SAT_VB || "10");

      if (fees.hourFee <= maxFee) {
        console.log(
          `[Scheduled] Fee rate ${fees.hourFee} <= ${maxFee}, processing low_fee pool`,
        );
        await stub.fetch(
          new Request("http://internal/pool/low_fee/process", {
            method: "POST",
          }),
        );
      }
    } catch (error) {
      console.error("[Scheduled] Failed to check fees:", error);
    }
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function isValidBitcoinAddress(address: string): boolean {
  // Testnet4/Testnet addresses (tb1, m, n, 2)
  // Mainnet addresses (bc1, 1, 3)
  const patterns = [
    /^tb1[a-zA-HJ-NP-Z0-9]{39,59}$/, // Testnet bech32
    /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Testnet P2PKH
    /^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Testnet P2SH
    /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/, // Mainnet bech32
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Mainnet P2PKH/P2SH
  ];

  return patterns.some((p) => p.test(address));
}

function isValidPoolType(poolType: string): poolType is PoolType {
  return ["weekly", "monthly", "low_fee", "immediate"].includes(poolType);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
};
