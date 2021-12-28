[
  (true)
  (false)
  (NULL)
] @constant.builtin

[
  (integer)
  (hex)
  (bit)
] @number

(string) @string

(call 
  function: (identifier) @function)

[
  "NOT"
  "AND"
  "&&"
  "OR"
  "||"
] @operator

[
  "AS"
  "ASC"
  "DESC"
  "FROM"
  "LIMIT"
  "OFFSET"
  "SELECT"
  "WHERE"
] @keyword
