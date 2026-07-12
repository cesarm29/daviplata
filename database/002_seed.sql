INSERT INTO users (id, full_name, email, password_hash, phone, document_id, status)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Juan Perez',
  'juan@correo.com',
  '$2a$12$LJ3m4ys3Lk0TSwHjQU2qeOYJt8rHhYJY7K9N6m8p1q2r3s4t5u6v',
  '3001234567',
  '1234567890',
  'ACTIVE'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO accounts (id, user_id, account_number, balance, currency)
VALUES (
  'b1c2d3e4-f5a6-7890-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '550001234567',
  500000.00,
  'COP'
) ON CONFLICT (account_number) DO NOTHING;

INSERT INTO users (id, full_name, email, password_hash, phone, document_id, status)
VALUES (
  'c1d2e3f4-a5b6-7890-cdef-123456789012',
  'Maria Garcia',
  'maria@correo.com',
  '$2a$12$LJ3m4ys3Lk0TSwHjQU2qeOYJt8rHhYJY7K9N6m8p1q2r3s4t5u6v',
  '3009876543',
  '0987654321',
  'ACTIVE'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO accounts (id, user_id, account_number, balance, currency)
VALUES (
  'd1e2f3a4-b5c6-7890-defa-234567890123',
  'c1d2e3f4-a5b6-7890-cdef-123456789012',
  '550009876543',
  300000.00,
  'COP'
) ON CONFLICT (account_number) DO NOTHING;
