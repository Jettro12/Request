-- Use psql's `\gexec` to conditionally create databases.
-- `CREATE DATABASE` cannot run inside PL/pgSQL functions or DO blocks,
-- so we emit CREATE statements only when the DB does not exist and execute them.

SELECT 'CREATE DATABASE authdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'authdb') \gexec
SELECT 'CREATE DATABASE usersdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'usersdb') \gexec
SELECT 'CREATE DATABASE postsdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'postsdb') \gexec
SELECT 'CREATE DATABASE requestsdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'requestsdb') \gexec
SELECT 'CREATE DATABASE notificationsdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notificationsdb') \gexec
SELECT 'CREATE DATABASE profiledb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'profiledb') \gexec
SELECT 'CREATE DATABASE ratingsdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ratingsdb') \gexec
SELECT 'CREATE DATABASE messagesdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'messagesdb') \gexec
SELECT 'CREATE DATABASE conversationsdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'conversationsdb') \gexec

-- Otorgar permisos (esto es seguro repetir)
GRANT ALL PRIVILEGES ON DATABASE authdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE usersdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE postsdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE requestsdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notificationsdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE profiledb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE ratingsdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE messagesdb TO postgres;
GRANT ALL PRIVILEGES ON DATABASE conversationsdb TO postgres;
 