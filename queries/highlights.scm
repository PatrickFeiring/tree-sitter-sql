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
  "CHARSET"
  "COLUMN"
  "COLLATE"
  "CONNECTION"
  "CREATE_DATABASE"
  "CREATE_TABLE"
  "DATABASES"
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
  "KILL"
  "LEFT"
  "LIMIT"
  "MODIFY"
  "OFFSET"
  "ON_DUPLICATE_KEY_UPDATE"
  "ORDER_BY"
  "PROCESSLIST"
  "QUERY"
  "RIGHT"
  "SELECT"
  "SET"
  "SET_NAMES"
  "SHOW"
  "SHOW_CREATE_TABLE"
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
