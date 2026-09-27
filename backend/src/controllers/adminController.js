import pool from "../config/database.js";
import { z } from "zod";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const parsePage = (value) => parsePositiveInt(value, 1);
const parseLimit = (value) => Math.min(parsePositiveInt(value, 20), 100);

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const safeUserRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  created_at: row.created_at,
  vehicle_count: Number(row.vehicle_count ?? 0),
  session_count: Number(row.session_count ?? 0),
});

const userRoleSchema = z.enum(["user", "admin"]);

const userCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  role: userRoleSchema.default("user"),
});

const userRoleUpdateSchema = z.object({
  role: userRoleSchema,
});

const vehiclePatchSchema = z
  .object({
    vehicle_number: z.string().trim().min(1).max(50).optional(),
    arrival_time: z.string().optional(),
    initial_soc: z.coerce.number().min(0).max(100).optional(),
    battery_capacity_kwh: z.coerce.number().positive().optional(),
    priority: z.enum(["Emergency", "High", "Medium", "Low"]).optional(),
    deadline: z.string().optional(),
    user_id: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path: ["body"],
  });

const chargingBaySchema = z.object({
  bay_number: z.string().trim().min(1).max(50),
  charger_type: z.enum(["AC", "DC"]),
  max_power_kw: z.coerce.number().positive(),
  status: z.enum(["available", "occupied", "maintenance"]).default("available"),
});

const chargingBayPatchSchema = chargingBaySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path: ["body"],
  });

const gridSlotSchema = z.object({
  slot_time: z.string(),
  max_capacity_kw: z.coerce.number().positive(),
  electricity_price: z.coerce.number().nonnegative(),
  current_load_kw: z.coerce.number().nonnegative(),
});

const gridSlotPatchSchema = gridSlotSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path: ["body"],
  });

const chargingSessionPatchSchema = z
  .object({
    user_id: z.coerce.number().int().positive().optional(),
    vehicle_id: z.coerce.number().int().positive().optional(),
    charging_bay_id: z.coerce.number().int().positive().optional(),
    grid_slot_id: z.coerce.number().int().positive().nullable().optional(),
    start_time: z.string().optional(),
    end_time: z.string().nullable().optional(),
    power_kw: z.coerce.number().positive().optional(),
    energy_delivered_kwh: z.coerce.number().nonnegative().optional(),
    status: z
      .enum(["scheduled", "charging", "completed", "cancelled"])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
    path: ["body"],
  });

export const getAdminDashboard = async (req, res, next) => {
  try {
    const userCounts = await pool.query(
      `SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE role = 'admin') AS total_admins,
        COUNT(*) FILTER (WHERE role = 'user') AS total_normal_users
      FROM users`,
    );

    const vehicleTotals = await pool.query(
      `SELECT COUNT(*) AS total_vehicles FROM vehicles`,
    );

    const sessionTotals = await pool.query(
      `SELECT
        COUNT(*) AS total_sessions,
        COUNT(*) FILTER (WHERE status = 'charging') AS active_sessions,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_sessions
      FROM charging_sessions`,
    );

    const bayTotals = await pool.query(
      `SELECT
        COUNT(*) AS total_bays,
        COUNT(*) FILTER (WHERE status = 'available') AS available_bays,
        COUNT(*) FILTER (WHERE status = 'occupied') AS occupied_bays
      FROM charging_bays`,
    );

    const gridSlotTotals = await pool.query(
      `SELECT COUNT(*) AS total_grid_slots FROM grid_slots`,
    );

    const recentUsers = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC NULLS LAST
       LIMIT 5`,
    );

    const recentVehicles = await pool.query(
      `SELECT v.id, v.vehicle_number, v.arrival_time, v.priority, v.user_id, u.name AS owner_name
       FROM vehicles v
       LEFT JOIN users u ON u.id = v.user_id
       ORDER BY v.arrival_time DESC NULLS LAST
       LIMIT 5`,
    );

    const recentSessions = await pool.query(
      `SELECT cs.id, cs.status, cs.start_time, cs.user_id, cs.vehicle_id, cs.charging_bay_id
       FROM charging_sessions cs
       ORDER BY cs.start_time DESC NULLS LAST
       LIMIT 5`,
    );

    const dashboard = {
      users: {
        total: Number(userCounts.rows[0]?.total_users ?? 0),
        admins: Number(userCounts.rows[0]?.total_admins ?? 0),
        normal: Number(userCounts.rows[0]?.total_normal_users ?? 0),
      },
      vehicles: {
        total: Number(vehicleTotals.rows[0]?.total_vehicles ?? 0),
      },
      chargingSessions: {
        total: Number(sessionTotals.rows[0]?.total_sessions ?? 0),
        active: Number(sessionTotals.rows[0]?.active_sessions ?? 0),
        completed: Number(sessionTotals.rows[0]?.completed_sessions ?? 0),
      },
      chargingBays: {
        total: Number(bayTotals.rows[0]?.total_bays ?? 0),
        available: Number(bayTotals.rows[0]?.available_bays ?? 0),
        occupied: Number(bayTotals.rows[0]?.occupied_bays ?? 0),
      },
      gridSlots: {
        total: Number(gridSlotTotals.rows[0]?.total_grid_slots ?? 0),
      },
      recentUsers: recentUsers.rows,
      recentVehicles: recentVehicles.rows,
      recentChargingSessions: recentSessions.rows,
    };

    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const search = String(req.query.search || "").trim();
    const role = req.query.role;
    const allowedRole = role === "admin" || role === "user" ? role : null;

    const where = [];
    const params = [];

    if (search) {
      where.push("(u.name ILIKE $1 OR u.email ILIKE $1)");
      params.push(`%${search}%`);
    }

    if (allowedRole) {
      where.push(`u.role = $${params.length + 1}`);
      params.push(allowedRole);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const countQuery = `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = Number(countResult.rows[0]?.total ?? 0);

    const offset = (page - 1) * limit;
    const rowsQuery = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        (SELECT COUNT(*) FROM vehicles v WHERE v.user_id = u.id) AS vehicle_count,
        (SELECT COUNT(*) FROM charging_sessions cs WHERE cs.user_id = u.id) AS session_count
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const rowsResult = await pool.query(rowsQuery, [...params, limit, offset]);

    return res.status(200).json({
      success: true,
      data: {
        users: rowsResult.rows.map(safeUserRow),
        pagination: buildPagination(page, limit, total),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        (SELECT COUNT(*) FROM vehicles v WHERE v.user_id = u.id) AS vehicle_count,
        (SELECT COUNT(*) FROM charging_sessions cs WHERE cs.user_id = u.id) AS session_count
      FROM users u
      WHERE u.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, data: safeUserRow(result.rows[0]) });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const { name, email, password, role } = parsed.data;
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.default.hash(password, 10);
    const insert = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role],
    );

    return res.status(201).json({ success: true, data: insert.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = userRoleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    if (Number(req.user.id) === Number(id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot change your own role from this endpoint",
        });
    }

    const target = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [id],
    );
    if (target.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (target.rows[0].role === "admin" && parsed.data.role === "user") {
      const remainingAdmins = await pool.query(
        "SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin' AND id <> $1",
        [id],
      );
      if ((remainingAdmins.rows[0].total ?? 0) === 0) {
        return res
          .status(409)
          .json({
            success: false,
            message: "At least one admin account must remain",
          });
      }
    }

    const updated = await pool.query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, name, email, role, created_at`,
      [parsed.data.role, id],
    );

    return res.status(200).json({ success: true, data: updated.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (Number(req.user.id) === Number(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }
    const current = await pool.query(
      "SELECT id, role FROM users WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (current.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (current.rows[0].role === "admin") {
      const remainingAdmins = await pool.query(
        "SELECT COUNT(*)::int AS total FROM users WHERE role = 'admin' AND id <> $1",
        [id],
      );
      if ((remainingAdmins.rows[0].total ?? 0) === 0) {
        return res
          .status(409)
          .json({
            success: false,
            message: "The final admin account cannot be deleted",
          });
      }
    }

    const deleted = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role",
      [id],
    );

    return res
      .status(200)
      .json({
        success: true,
        data: deleted.rows[0],
        message: "User deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const getAdminVehicles = async (req, res, next) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const search = String(req.query.search || "").trim();
    const ownerId = req.query.ownerId ? Number(req.query.ownerId) : null;
    const priority = req.query.priority;
    const where = [];
    const params = [];

    if (search) {
      where.push("v.vehicle_number ILIKE $1");
      params.push(`%${search}%`);
    }

    if (ownerId) {
      where.push(`v.user_id = $${params.length + 1}`);
      params.push(ownerId);
    }

    if (priority && ["Emergency", "High", "Medium", "Low"].includes(priority)) {
      where.push(`v.priority = $${params.length + 1}`);
      params.push(priority);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM vehicles v ${whereClause}`,
      params,
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const offset = (page - 1) * limit;

    const rows = await pool.query(
      `SELECT
        v.id,
        v.vehicle_number,
        v.user_id,
        u.name AS owner_name,
        u.email AS owner_email,
        v.arrival_time,
        v.initial_soc,
        v.battery_capacity_kwh,
        v.priority,
        v.deadline
      FROM vehicles v
      LEFT JOIN users u ON u.id = v.user_id
      ${whereClause}
      ORDER BY v.arrival_time DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return res.status(200).json({
      success: true,
      data: {
        vehicles: rows.rows,
        pagination: buildPagination(page, limit, total),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminVehicleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        v.id,
        v.vehicle_number,
        v.user_id,
        u.name AS owner_name,
        u.email AS owner_email,
        v.arrival_time,
        v.initial_soc,
        v.battery_capacity_kwh,
        v.priority,
        v.deadline
      FROM vehicles v
      LEFT JOIN users u ON u.id = v.user_id
      WHERE v.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateAdminVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = vehiclePatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const entries = Object.entries(parsed.data);
    if (entries.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields provided" });
    }

    const keys = entries.map(([key]) => key);
    const setClauses = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const values = entries.map(([, value]) => value);
    const query = `UPDATE vehicles SET ${setClauses} WHERE id = $${entries.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Vehicle number already exists" });
    }
    next(error);
  }
};

export const deleteAdminVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM vehicles WHERE id = $1 RETURNING id, vehicle_number",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        data: result.rows[0],
        message: "Vehicle deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const getAdminChargingSessions = async (req, res, next) => {
  try {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const vehicleId = req.query.vehicleId ? Number(req.query.vehicleId) : null;
    const bayId = req.query.bayId ? Number(req.query.bayId) : null;
    const status = req.query.status;
    const where = [];
    const params = [];

    if (userId) {
      where.push(`cs.user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (vehicleId) {
      where.push(`cs.vehicle_id = $${params.length + 1}`);
      params.push(vehicleId);
    }

    if (bayId) {
      where.push(`cs.charging_bay_id = $${params.length + 1}`);
      params.push(bayId);
    }

    if (
      status &&
      ["scheduled", "charging", "completed", "cancelled"].includes(status)
    ) {
      where.push(`cs.status = $${params.length + 1}`);
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM charging_sessions cs ${whereClause}`,
      params,
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const offset = (page - 1) * limit;

    const rows = await pool.query(
      `SELECT
        cs.id,
        u.name AS user_name,
        u.email AS user_email,
        v.vehicle_number,
        cb.bay_number,
        gs.id AS grid_slot_id,
        cs.start_time,
        cs.end_time,
        cs.power_kw,
        cs.energy_delivered_kwh,
        cs.status,
        cs.user_id,
        cs.vehicle_id,
        cs.charging_bay_id
      FROM charging_sessions cs
      LEFT JOIN users u ON u.id = cs.user_id
      LEFT JOIN vehicles v ON v.id = cs.vehicle_id
      LEFT JOIN charging_bays cb ON cb.id = cs.charging_bay_id
      LEFT JOIN grid_slots gs ON gs.id = cs.grid_slot_id
      ${whereClause}
      ORDER BY cs.start_time DESC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    return res
      .status(200)
      .json({
        success: true,
        data: {
          chargingSessions: rows.rows,
          pagination: buildPagination(page, limit, total),
        },
      });
  } catch (error) {
    next(error);
  }
};

export const getAdminChargingSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        cs.*,
        u.name AS user_name,
        u.email AS user_email,
        v.vehicle_number,
        cb.bay_number,
        gs.id AS grid_slot_id
      FROM charging_sessions cs
      LEFT JOIN users u ON u.id = cs.user_id
      LEFT JOIN vehicles v ON v.id = cs.vehicle_id
      LEFT JOIN charging_bays cb ON cb.id = cs.charging_bay_id
      LEFT JOIN grid_slots gs ON gs.id = cs.grid_slot_id
      WHERE cs.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Charging session not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateAdminChargingSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = chargingSessionPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const entries = Object.entries(parsed.data);
    const query = `UPDATE charging_sessions SET ${entries.map(([key], index) => `${key} = $${index + 1}`).join(", ")} WHERE id = $${entries.length + 1} RETURNING *`;
    const values = [...entries.map(([, value]) => value), id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Charging session not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminChargingSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM charging_sessions WHERE id = $1 RETURNING id, status",
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Charging session not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        data: result.rows[0],
        message: "Charging session deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const getAdminChargingBays = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, bay_number, charger_type, max_power_kw, status
       FROM charging_bays
       ORDER BY id`,
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getAdminChargingBayById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM charging_bays WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Charging bay not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createAdminChargingBay = async (req, res, next) => {
  try {
    const parsed = chargingBaySchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const result = await pool.query(
      `INSERT INTO charging_bays (bay_number, charger_type, max_power_kw, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        parsed.data.bay_number,
        parsed.data.charger_type,
        parsed.data.max_power_kw,
        parsed.data.status,
      ],
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Bay number already exists" });
    }
    next(error);
  }
};

export const updateAdminChargingBay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = chargingBayPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const entries = Object.entries(parsed.data);
    const result = await pool.query(
      `UPDATE charging_bays SET ${entries.map(([key], index) => `${key} = $${index + 1}`).join(", ")} WHERE id = $${entries.length + 1} RETURNING *`,
      [...entries.map(([, value]) => value), id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Charging bay not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Bay number already exists" });
    }
    next(error);
  }
};

export const deleteAdminChargingBay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usage = await pool.query(
      "SELECT id FROM charging_sessions WHERE charging_bay_id = $1 LIMIT 1",
      [id],
    );
    if (usage.rows.length > 0) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Charging bay is still referenced by charging sessions",
        });
    }

    const result = await pool.query(
      "DELETE FROM charging_bays WHERE id = $1 RETURNING id, bay_number",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Charging bay not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        data: result.rows[0],
        message: "Charging bay deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const getAdminGridSlots = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, slot_time, max_capacity_kw, electricity_price, current_load_kw
       FROM grid_slots
       ORDER BY slot_time`,
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getAdminGridSlotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM grid_slots WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Grid slot not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createAdminGridSlot = async (req, res, next) => {
  try {
    const parsed = gridSlotSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const result = await pool.query(
      `INSERT INTO grid_slots (slot_time, max_capacity_kw, electricity_price, current_load_kw)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        parsed.data.slot_time,
        parsed.data.max_capacity_kw,
        parsed.data.electricity_price,
        parsed.data.current_load_kw,
      ],
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateAdminGridSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = gridSlotPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Validation failed",
          error: parsed.error.flatten(),
        });
    }

    const entries = Object.entries(parsed.data);
    const result = await pool.query(
      `UPDATE grid_slots SET ${entries.map(([key], index) => `${key} = $${index + 1}`).join(", ")} WHERE id = $${entries.length + 1} RETURNING *`,
      [...entries.map(([, value]) => value), id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Grid slot not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminGridSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM grid_slots WHERE id = $1 RETURNING id, slot_time",
      [id],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Grid slot not found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        data: result.rows[0],
        message: "Grid slot deleted successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const getAdminSystem = async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
        (SELECT COUNT(*) FROM charging_sessions WHERE status = 'charging') AS active_sessions,
        (SELECT COUNT(*) FROM charging_bays WHERE status = 'available') AS available_bays,
        (SELECT COUNT(*) FROM charging_bays WHERE status = 'occupied') AS occupied_bays,
        (SELECT COUNT(*) FROM grid_slots) AS total_grid_slots
      `,
    );

    const databaseHealth = await pool.query("SELECT NOW() AS current_time");
    const startedAt = new Date();
    const uptimeSeconds = Math.max(
      0,
      Math.round((Date.now() - startedAt.getTime()) / 1000),
    );

    return res.status(200).json({
      success: true,
      data: {
        database: {
          connected: true,
          current_time: databaseHealth.rows[0]?.current_time,
        },
        users: { total: Number(stats.rows[0]?.total_users ?? 0) },
        vehicles: { total: Number(stats.rows[0]?.total_vehicles ?? 0) },
        chargingSessions: {
          active: Number(stats.rows[0]?.active_sessions ?? 0),
        },
        chargingBays: {
          available: Number(stats.rows[0]?.available_bays ?? 0),
          occupied: Number(stats.rows[0]?.occupied_bays ?? 0),
        },
        gridSlots: { total: Number(stats.rows[0]?.total_grid_slots ?? 0) },
        server: { uptimeSeconds },
      },
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: {
        database: { connected: false },
        users: { total: 0 },
        vehicles: { total: 0 },
        chargingSessions: { active: 0 },
        chargingBays: { available: 0, occupied: 0 },
        gridSlots: { total: 0 },
        server: { uptimeSeconds: 0 },
      },
      message: "System status is degraded; database health checks failed.",
    });
  }
};
