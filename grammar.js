// Operator precedence
//
// https://dev.mysql.com/doc/refman/8.0/en/operator-precedence.html
const PREC = {
    INTERVAL: 14,
    MULTIPLICATION: 13, // *, /, DIV, %, MOD
    ADDITION: 12, // -, +
    BITSHIFT: 11, // <<, >>
    BITWISE_AND: 10, // &
    BITWISE_OR: 9, // |
    COMPARISON: 8, // = (comparison), <=>, >=, >, <=, <, <>, !=, IS, LIKE, REGEXP, IN, MEMBER OF
    NOT: 7,
    AND: 6, // AND, &&
    XOR: 5,
    OR: 4, // OR, ||
    ASSIGNMENT: 3, // :=
    LITERAL: 2,
};

module.exports = grammar({
    name: "mysql",

    extras: ($) => [$.comment, /[\s\p{Zs}\uFEFF\u2060\u200B]/],

    rules: {
        source_file: ($) => repeat($.statement),

        statement: ($) =>
            seq(
                choice(
                    $.select_statement,
                    $.update_statement,
                    $.delete_statement,
                    $.table_statement,
                    $.alter_table_statement,
                    $.drop_table_statement,
                    $.truncate_table_statement,
                    $.insert_statement,
                    $.create_table_statement,
                    $.show_tables_statement,
                    $.explain_table_statement
                ),
                optional(choice(";", "\\G"))
            ),

        // Create table statement
        // https://dev.mysql.com/doc/refman/8.0/en/create-table.html
        create_table_statement: ($) =>
            seq(
                keyword("CREATE TABLE"),
                optional("IF NOT EXISTS"),
                $.identifier,
                "(",
                commaSeparated1($.create_definition),
                ")"
            ),

        create_definition: ($) => seq($.identifier, $.column_definition),

        column_definition: ($) =>
            seq(
                $.data_type,
                optional(seq(optional("NOT"), $.NULL)),
                optional(seq("DEFAULT", $._expression)),
                optional(choice("VISIBLE", "INVISIBLE")),
                optional("AUTO_INCREMENT"),
                optional(seq("UNIQUE", optional("KEY"))),
                optional(seq(optional("PRIMARY"), "KEY")),
                optional(seq("COMMENT", $.string))
            ),

        // https://dev.mysql.com/doc/refman/8.0/en/data-types.html
        data_type: ($) =>
            choice(
                withDisplayWidth($, "TINYINT"),
                withDisplayWidth($, "SMALLINT"),
                withDisplayWidth($, "INT"),
                withDisplayWidth($, "INTEGER"),
                withDisplayWidth($, "BIGINT"),
                "DECIMAL",
                "DEC",
                "FIXED",
                "NUMERIC",
                "FLOAT",
                "DOUBLE PRECISION",
                "DOUBLE",
                "REAL",
                "BIT",

                "DATE",
                "TIME",
                "DATETIME",
                "TIMESTAMP",
                "YEAR",

                seq("CHAR", "(", $.integer, ")"),
                seq("VARCHAR", "(", $.integer, ")"),

                seq("BINARY", "(", $.integer, ")"),
                seq("VARBINARY", "(", $.integer, ")"),

                "TINYBLOB",
                "BLOB",
                "MEDIUMBLOB",
                "LONGBLOB",

                "TINYTEXT",
                "TEXT",
                "MEDIUMTEXT",
                "LONGTEXT",

                seq("ENUM", "(", commaSeparated1($.string), ")"),

                seq("SET", "(", commaSeparated1($.string), ")")
            ),

        table_statement: ($) =>
            seq(
                "TABLE",
                $.table_name,
                optional(seq("ORDER BY", $.column_name)),
                $.limit_offset_clause
            ),

        alter_table_statement: ($) =>
            seq(
                "ALTER TABLE",
                $.table_name,
                choice(
                    seq("ADD", optional("COLUMN"), $.column_definition),
                    seq(
                        "CHANGE",
                        optional("COLUMN"),
                        $.identifier,
                        $.identifier,
                        $.column_definition,
                        optional(choice("FIRST", seq("AFTER", $.identifier)))
                    ),
                    seq("MODIFY", optional("COLUMN"), $.column_definition),
                    seq(
                        "ADD",
                        choice("INDEX", "KEY"),
                        optional($.identifier),
                        optional($.index_type)
                    )
                )
            ),

        index_type: ($) => seq("USING", choice("BTREE", "HASH")),

        // Select statement
        // https://dev.mysql.com/doc/refman/8.0/en/select.html
        select_statement: ($) =>
            seq(
                keyword("SELECT"),
                $.select_expression,
                keyword("FROM"),
                $.table_references,
                optional($.where_clause),
                optional($.group_by_clause),
                optional($.having_clause),
                optional($.order_by_clause),
                optional($.limit_offset_clause)
            ),

        update_statement: ($) =>
            choice(
                $._single_table_update_statement
                // $._multi_table_update_statement,
            ),

        _single_table_update_statement: ($) =>
            seq(
                keyword("UPDATE"),
                optional("LOW_PRIORITY"),
                optional("IGNORE"),
                $.table_name,
                keyword("SET"),
                $.assignment_list,
                optional($.where_clause),
                optional($.order_by_clause),
                optional($.limit_clause)
            ),

        _multi_table_update_statement: ($) =>
            seq(
                keyword("UPDATE"),
                optional("LOW_PRIORITY"),
                optional("IGNORE"),
                $.table_name,
                keyword("SET"),
                $.assignment_list,
                optional($.where_clause)
            ),

        assignment_list: ($) => commaSeparated1($.assignment),

        assignment: ($) =>
            seq(
                field("column", $.column_name),
                prec.left(PREC.ASSIGNMENT, seq("=", field("value", $.value)))
            ),

        value: ($) => choice("DEFAULT", $._expression),

        // Delete statement
        // https://dev.mysql.com/doc/refman/8.0/en/delete.html
        delete_statement: ($) =>
            seq(
                keyword("DELETE FROM"),
                $.table_name,
                $.where_clause,
                $.order_by_clause,
                $.limit_clause
            ),

        // https://dev.mysql.com/doc/refman/8.0/en/drop-table.html
        drop_table_statement: ($) =>
            seq(
                "DROP",
                optional("TEMPORARY"),
                "TABLE",
                optional("IF EXISTS"),
                $.table_name
            ),

        // https://dev.mysql.com/doc/refman/8.0/en/truncate-table.html
        truncate_table_statement: ($) =>
            seq("TRUNCATE", optional("TABLE"), $.table_name),

        // https://dev.mysql.com/doc/refman/8.0/en/show-tables.html
        show_tables_statement: ($) =>
            seq(
                "SHOW",
                optional("EXTENDED"),
                optional("FULL"),
                "TABLES",
                optional(seq(choice("FROM", "IN"), $.identifier)),
                optional(seq("LIKE", $.like_pattern))
            ),

        // Explain statement
        // https://dev.mysql.com/doc/refman/8.0/en/explain.html
        explain_table_statement: ($) =>
            seq(
                choice(
                    "EXPLAIN",
                    "DESCRIBE"
                    // "DESC"
                ),
                choice(
                    seq(
                        $.table_name,
                        optional(choice($.identifier, $.like_pattern))
                    )
                )
            ),

        // Insert statement
        insert_statement: ($) =>
            seq(
                "INSERT",
                optional("IGNORE"),
                "INTO",
                $.table_name,
                choice(
                    seq(
                        $.column_list,
                        "VALUES",
                        commaSeparated1($.value_list),
                        optional($.on_duplicate_key_clause)
                    ),
                    seq(
                        "(",
                        $.select_statement,
                        ")",
                        optional($.on_duplicate_key_clause)
                    )
                )
            ),

        column_list: ($) => seq("(", commaSeparated($.identifier), ")"),

        value_list: ($) => seq("(", commaSeparated($._expression), ")"),

        on_duplicate_key_clause: ($) => seq("ON DUPLICATE KEY UPDATE"),

        select_expression: ($) =>
            choice(
                "*",
                commaSeparated1(choice(seq($.identifier, ".", "*"), $.column))
            ),

        table_references: ($) =>
            seq(
                choice(
                    seq($.table_name, optional($._alias)),
                    seq("(", $.select_statement, ")", $._alias)
                ),
                optional($.join_clause)
            ),

        join_clause: ($) =>
            choice(
                seq(
                    choice(
                        seq(optional(choice("INNER", "CROSS")), "JOIN"),
                        "STRAIGHT_JOIN"
                    ),
                    $.identifier,
                    optional($._join_specification)
                ),
                seq(
                    choice("LEFT", "RIGHT"),
                    optional("OUTER"),
                    "JOIN",
                    $.identifier,
                    $._join_specification
                ),
                seq("NATURAL", "JOIN", $.identifier)
            ),

        _join_specification: ($) =>
            choice(
                choice(
                    seq("ON", $._expression),
                    seq("USING", "(", commaSeparated1($.identifier), ")")
                )
            ),

        column: ($) => seq($._expression, optional($._alias)),

        where_clause: ($) => seq(keyword("WHERE"), $.where_condition),

        where_condition: ($) => choice($._expression),

        group_by_clause: ($) =>
            seq(
                keyword("GROUP BY"),
                commaSeparated1($.column),
                optional(keyword("WITH ROLLUP"))
            ),

        having_clause: ($) => seq(keyword("HAVING"), $.where_condition),

        order_by_clause: ($) =>
            seq(
                keyword("ORDER BY"),
                commaSeparated1(seq($.column, optional(choice("ASC", "DESC"))))
            ),

        // Limit clauses are sometimes applicable without the offset
        // clause, e.g. in delete statements
        offset_clause: ($) => seq(keyword("OFFSET"), $.integer),

        limit_clause: ($) => seq(keyword("LIMIT"), $.integer),

        limit_offset_clause: ($) =>
            seq($.limit_clause, optional($.offset_clause)),

        // Basic components used as building block in many types of
        // statements and expressions.

        // Alias can be used without the explicit AS
        _alias: ($) =>
            seq(optional(keyword("AS")), field("alias", $.identifier)),

        call: ($) =>
            seq(
                field("function", $.identifier),
                "(",
                field("arguments", commaSeparated($._expression)),
                ")"
            ),

        // Operators
        // https://dev.mysql.com/doc/refman/8.0/en/non-typed-operators.html
        _expression: ($) =>
            choice(
                $.parenthesized_expression,
                $._literal,
                $.call,
                $._field,
                $.unary_expression,
                $.interval_expression,
                $.binary_expression,
                $.in_expression,
                $.like_expression,
                $.regex_expression,
                $.between_expression
            ),

        parenthesized_expression: ($) => seq("(", $._expression, ")"),

        unary_expression: ($) =>
            choice(
                ...[["NOT", PREC.NOT]].map(([operator, p]) =>
                    prec.left(
                        p,
                        seq(
                            field("operator", operator),
                            field("value", $._expression)
                        )
                    )
                )
            ),

        binary_expression: ($) =>
            choice(
                ...[
                    ["*", PREC.MULTIPLICATION],
                    ["/", PREC.MULTIPLICATION],
                    ["DIV", PREC.MULTIPLICATION],
                    ["%", PREC.MULTIPLICATION],
                    ["MOD", PREC.MULTIPLICATION],
                    ["-", PREC.ADDITION],
                    ["+", PREC.ADDITION],
                    ["<<", PREC.BITSHIFT],
                    [">>", PREC.BITSHIFT],
                    ["&", PREC.BITWISE_AND],
                    ["|", PREC.BITWISE_OR],
                    ["=", PREC.COMPARISON],
                    ["<=>", PREC.COMPARISON],
                    [">=", PREC.COMPARISON],
                    [">", PREC.COMPARISON],
                    ["<=", PREC.COMPARISON],
                    ["<", PREC.COMPARISON],
                    ["<>", PREC.COMPARISON],
                    ["!>", PREC.COMPARISON],
                    ["IS", PREC.COMPARISON],
                    ["AND", PREC.AND],
                    ["&&", PREC.AND],
                    ["XOR", PREC.XOR],
                    ["OR", PREC.OR],
                    ["||", PREC.OR],
                ].map(([operator, p]) =>
                    prec.left(
                        p,
                        seq(
                            field("left", $._expression),
                            field("operator", operator),
                            field("right", $._expression)
                        )
                    )
                )
            ),

        in_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                choice(
                    seq(
                        $._expression,
                        optional("NOT"),
                        "IN",
                        "(",
                        commaSeparated1($._expression),
                        ")"
                    )
                )
            ),

        // https://dev.mysql.com/doc/refman/8.0/en/string-comparison-functions.html#operator_not-like
        like_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                choice(
                    seq($._expression, "LIKE", $.like_pattern),
                    seq($._expression, "NOT LIKE", $.like_pattern)
                )
            ),

        regex_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                choice(
                    seq($._expression, "REGEXP", $.regex_pattern),
                    seq($._expression, "NOT REGEXP", $.regex_pattern)
                )
            ),

        between_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                seq(
                    $._expression,
                    "BETWEEN",
                    $._expression,
                    "AND",
                    $._expression
                )
            ),

        interval_expression: ($) =>
            prec.left(
                PREC.INTERVAL,
                seq("INTERVAL", $._expression, $.interval_unit)
            ),

        interval_unit: ($) =>
            choice(
                "MICROSECOND",
                "SECOND",
                "MINUTE",
                "HOUR",
                "DAY",
                "WEEK",
                "MONTH",
                "QUARTER",
                "YEAR"
            ),

        like_pattern: ($) => $.string,

        regex_pattern: ($) => $.string,

        // Identifiers can quoted if keywords are used as names
        identifier: ($) => choice($._identifier, seq("`", $._identifier, "`")),
        _identifier: ($) => /[a-zA-Z][0-9a-zA-Z_]*/,

        _field: ($) => seq(optional(seq($.identifier, ".")), $.identifier),

        column_name: ($) =>
            seq(optional($.table_name), field("column", $.identifier)),

        table_name: ($) =>
            seq(
                optional(field("database", seq($.identifier, "."))),
                field("table", $.identifier)
            ),

        database_name: ($) => field("database", $.identifier),

        // Literals
        // https://dev.mysql.com/doc/refman/8.0/en/literals.html
        _literal: ($) =>
            prec(
                PREC.LITERAL,
                choice(
                    $.string,
                    $.integer,
                    $.hex,
                    $.bit,
                    $.float,
                    $.true,
                    $.false,
                    $.NULL
                )
            ),

        string: ($) => choice(/'[^']*'/, /"[^']*"/),

        integer: ($) => /-?\d+/,

        hex: ($) => choice(/0x[0-9a-fA-F]+/, /(x|X)'[0-9a-fA-F]+'/),

        bit: ($) => choice(/0b[01]+/, /(b|B)'[01]+'/),

        float: ($) => /\d+\.\d+/,

        true: ($) => "true",

        false: ($) => "false",

        NULL: ($) => "NULL",

        // https://dev.mysql.com/doc/refman/8.0/en/comments.html
        comment: ($) =>
            token(
                choice(
                    seq("--", /.*/),
                    seq("#", /.*/),
                    seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
                )
            ),
    },
});

function commaSeparated(rule) {
    return optional(seq(rule, repeat(seq(",", rule))));
}

function commaSeparated1(rule) {
    return seq(rule, repeat(seq(",", rule)));
}

function withDisplayWidth($, rule) {
    return seq(rule, optional(seq("(", $.integer, ")")));
}

function keyword(word) {
    return word;
}
