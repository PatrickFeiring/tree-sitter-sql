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
  "ALTER_TABLE"
  "AS"
  "ASC"
  "BTREE"
  "CASE"
  "CHANGE"
  "CHARACTER_SET"
  "COLUMN"
  "COLLATE"
  "CREATE_DATABASE"
  "CREATE_TABLE"
  "DEFAULT"
  "DELETE_FROM"
  "DESC"
  "DESCRIBE"
  "DROP"
  "ELSE"
  "ENCRYPTION"
  "END"
  "EXPLAIN"
  "FIRST"
  "FROM"
  "GROUP_BY"
  "HASH"
  "HAVING"
  "IF_EXISTS"
  "IF_NOT_EXISTS"
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
  "ON_DUPLICATE_KEY_UPDATE"
  "ORDER_BY"
  "RIGHT"
  "SELECT"
  "SET"
  "SET_NAMES"
  "SHOW"
  "TABLE"
  "TABLES"
  "TEMPORARY"
  "THEN"
  "TRUNCATE"
  "UPDATE"
  "USE"
  "USING"
  "VALUES"
  "WHERE"
  "WHEN"
  "WITH_ROLLUP"
] @keyword
