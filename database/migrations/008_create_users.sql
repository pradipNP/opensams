-- SAMS Nepal — Migration 008: Users

CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id          UUID         NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    province_id      UUID         REFERENCES provinces(id) ON DELETE SET NULL,
    municipality_id  UUID         REFERENCES municipalities(id) ON DELETE SET NULL,
    school_id        UUID         REFERENCES schools(id) ON DELETE SET NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    full_name        VARCHAR(200) NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE users IS 'Application users scoped by role to province, municipality, or school';

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_municipality ON users(municipality_id);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_email ON users(email);
