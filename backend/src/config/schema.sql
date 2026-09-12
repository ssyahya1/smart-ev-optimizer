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
    deadline TIMESTAMP NOT NULL
);

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