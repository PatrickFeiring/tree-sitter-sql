CREATE DATABASE IF NOT EXISTS my_database CHARACTER SET utf8mb4 COLLATE latin1_german2_ci ENCRYPTION='Y';
-- <- keyword
--              ^ keyword
--                                        ^ keyword
--                                                              ^ keyword
--                                                                                        ^ keyword

KILL QUERY 1;
-- <- keyword
--   ^ keyword

KILL CONNECTION 1;
-- <- keyword
--   ^ keyword

SET NAMES DEFAULT;
-- <- keyword
--        ^ keyword

SET CHARACTER SET DEFAULT;
-- <- keyword
--  ^ keyword
--                ^ keyword

SET CHARSET DEFAULT;
-- <- keyword
--  ^ keyword
--          ^ keyword

SHOW CREATE TABLE my_table;
-- <- keyword
--   ^ keyword
--          ^ keyword

SHOW DATABASES;
-- <- keyword
--   ^ keyword

SHOW PROCESSLIST;
-- <- keyword
--   ^ keyword

SHOW TABLES FROM my_database;
-- <- keyword
--   ^ keyword
--          ^ keyword
