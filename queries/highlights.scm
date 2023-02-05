[
  (NULL)
  "DAY"
] @constant.builtin

[
  (true)
  (false)
] @boolean

[
  (integer)
  (hex)
  (bit)
] @number

(float) @float
(string) @string

(comment) @comment

(call 
  function: (identifier) @function)

(data_type) @type

[
  "%"
  "&&"
  "/"
  "AND"
  "BETWEEN"
  "DIV"
  "IN"
  "INTERVAL"
  "LIKE"
  "MOD"
  "NOT"
  "OR"
  "REGEXP"
  "||"
] @operator

[
  ";"
  "("
  ")"
] @punctuation

[
  "AFTER"
  "ALTER TABLE"
  "AS"
  "ASC"
  "BTREE"
  "CHANGE"
  "COLUMN"
  "CREATE TABLE"
  "DEFAULT"
  "DELETE FROM"
  "DESC"
  "DESCRIBE"
  "DROP"
  "EXPLAIN"
  "FIRST"
  "FROM"
  "GROUP BY"
  "HASH"
  "IF EXISTS"
  "IF NOT EXISTS"
  "INDEX"
  "INNER"
  "IGNORE"
  "INSERT"
  "INTO"
  "IS"
  "JOIN"
  "KEY"
  "LEFT"
  "LIMIT"
  "MODIFY"
  "OFFSET"
  "ON DUPLICATE KEY UPDATE"
  "ORDER BY"
  "RIGHT"
  "SELECT"
  "SET"
  "SHOW"
  "TABLE"
  "TABLES"
  "TEMPORARY"
  "TRUNCATE"
  "UPDATE"
  "USING"
  "VALUES"
  "WHERE"
] @keyword
