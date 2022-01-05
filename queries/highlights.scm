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
  "AS"
  "ASC"
  "CREATE TABLE"
  "DEFAULT"
  "DELETE FROM"
  "DESC"
  "DESCRIBE"
  "DROP"
  "EXPLAIN"
  "FROM"
  "GROUP BY"
  "IF EXISTS"
  "IF NOT EXISTS"
  "INNER"
  "IGNORE"
  "INSERT"
  "INTO"
  "IS"
  "JOIN"
  "LEFT"
  "LIMIT"
  "OFFSET"
  "ON DUPLICATE KEY UPDATE"
  "ORDER BY"
  "RIGHT"
  "SELECT"
  "SHOW"
  "TABLE"
  "TABLES"
  "TEMPORARY"
  "TRUNCATE"
  "USING"
  "VALUES"
  "WHERE"
] @keyword
