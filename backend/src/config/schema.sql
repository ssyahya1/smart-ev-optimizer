CREATE TABLE  IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx
    ON refresh_tokens(user_id);

CREATE TABLE  IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    initial_soc NUMERIC(5,2) NOT NULL,
    battery_capacity_kwh NUMERIC(8,2) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS charging_bays (
    id SERIAL PRIMARY KEY,
    bay_number VARCHAR(50) UNIQUE NOT NULL,
    charger_type VARCHAR(20) NOT NULL,
    max_power_kw NUMERIC(8,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS grid_slots (
    id SERIAL PRIMARY KEY,
    slot_time TIMESTAMP NOT NULL,
    max_capacity_kw NUMERIC(10,2) NOT NULL,
    electricity_price NUMERIC(10,4) NOT NULL,
    current_load_kw NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS charging_sessions (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    vehicle_id INTEGER NOT NULL
        REFERENCES vehicles(id)
        ON DELETE CASCADE,

    charging_bay_id INTEGER NOT NULL
        REFERENCES charging_bays(id)
        ON DELETE CASCADE,

    grid_slot_id INTEGER
        REFERENCES grid_slots(id)
        ON DELETE SET NULL,

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,

    power_kw NUMERIC(10,2) NOT NULL,

    energy_delivered_kwh NUMERIC(10,2) DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
);

ALTER TABLE charging_sessions
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

UPDATE charging_sessions AS session
SET user_id = vehicle.user_id
FROM vehicles AS vehicle
WHERE session.vehicle_id = vehicle.id
  AND session.user_id IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM vehicles WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Legacy vehicles require an explicit user_id before ownership can be enforced';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM charging_sessions AS session
        LEFT JOIN vehicles AS vehicle ON vehicle.id = session.vehicle_id
        WHERE session.user_id IS NULL
           OR vehicle.id IS NULL
           OR session.user_id <> vehicle.user_id
    ) THEN
        RAISE EXCEPTION 'Charging-session owners must match their vehicle owners';
    END IF;

    ALTER TABLE vehicles ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE charging_sessions ALTER COLUMN user_id SET NOT NULL;
END $$;

CREATE INDEX IF NOT EXISTS vehicles_user_id_idx
    ON vehicles(user_id);

CREATE INDEX IF NOT EXISTS charging_sessions_user_start_idx
    ON charging_sessions(user_id, start_time);