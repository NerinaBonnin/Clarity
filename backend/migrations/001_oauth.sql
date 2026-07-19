-- Ejecutá esto en MySQL antes de usar Google/Apple Sign In
ALTER TABLE users
  MODIFY password VARCHAR(255) NULL,
  ADD COLUMN auth_provider ENUM('local', 'google', 'apple') NOT NULL DEFAULT 'local' AFTER password,
  ADD COLUMN provider_id VARCHAR(255) NULL AFTER auth_provider,
  ADD COLUMN avatar_url VARCHAR(500) NULL AFTER provider_id;

ALTER TABLE users
  ADD UNIQUE KEY unique_oauth (auth_provider, provider_id);
