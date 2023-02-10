// prettier-ignore
const PREC = {
    INTERVAL:       15,
    MULTIPLICATION: 14, // *, /, DIV, %, MOD
    ADDITION:       13, // -, +
    BITSHIFT:       12, // <<, >>
    BITWISE_AND:    11, // &
    BITWISE_OR:     10, // |
    COMPARISON:      9, // = (comparison), <=>, >=, >, <=, <, <>, !=, IS, LIKE, REGEXP, IN, MEMBER OF
    NOT:             8,
    AND:             7, // AND, &&
    XOR:             6,
    OR:              5, // OR, ||
    ASSIGNMENT:      4, // :=
    LITERAL:         3,
    JOIN:            2,
};

module.exports = grammar({
    name: "sql",

    extras: ($) => [$.comment, /[\s\p{Zs}\uFEFF\u2060\u200B]/],

    rules: {
        source_file: ($) => repeat($.statement),

        statement: ($) =>
            seq(
                choice(
                    $._data_definition_statement,
                    $._data_manipulation_statement,
                    $._database_administration_statements,
                    $._utility_statement
                ),
                choice(";", "\\G")
            ),

        _data_definition_statement: ($) =>
            choice(
                $.alter_table_statement,
                $.create_database_statement,
                $.create_table_statement,
                $.drop_table_statement,
                $.truncate_table_statement
            ),

        _data_manipulation_statement: ($) =>
            choice(
                $.delete_statement,
                $.insert_statement,
                $.select_statement,
                $.table_statement,
                $.update_statement
            ),

        _database_administration_statements: ($) =>
            choice($.kill_statement, $._set_statements, $._show_statements),

        _set_statements: ($) => choice($.set_names_statement),

        set_names_statement: ($) =>
            seq(kw("SET NAMES"), choice($.identifier, kw("DEFAULT"))),

        _show_statements: ($) =>
            choice(
                $.show_create_table_statement,
                $.show_databases_statement,
                $.show_processlist_statement,
                $.show_tables_statement
            ),

        _utility_statement: ($) =>
            choice(
                $.explain_table_statement,
                $.help_statement,
                $.use_statement
            ),

        create_database_statement: ($) =>
            seq(
                kw("CREATE DATABASE"),
                optional(kw("IF NOT EXISTS")),
                $.identifier,
                spaceSeparated($.create_option)
            ),

        create_option: ($) =>
            seq(
                optional(kw("DEFAULT")),
                choice(
                    seq(kw("CHARACTER SET"), optional("="), $.charset_name),
                    seq(kw("COLLATE"), optional("="), $.collation_name),
                    seq(kw("ENCRYPTION"), optional("="), choice("'Y'", "'N'"))
                )
            ),

        charset_name: ($) => $._identifier,
        collation_name: ($) => $._identifier,

        create_table_statement: ($) =>
            seq(
                kw("CREATE TABLE"),
                optional(kw("IF NOT EXISTS")),
                $.identifier,
                "(",
                commaSeparated1($.create_definition),
                ")"
            ),

        create_definition: ($) => seq($.identifier, $.column_definition),

        column_definition: ($) =>
            seq(
                $.data_type,
                optional(seq(optional(kw("NOT")), $.NULL)),
                optional(seq(kw("DEFAULT"), $._expression)),
                optional(choice(kw("VISIBLE"), kw("INVISIBLE"))),
                optional(kw("AUTO_INCREMENT")),
                optional(seq(kw("UNIQUE"), optional(kw("KEY")))),
                optional(seq(optional(kw("PRIMARY")), kw("KEY"))),
                optional(seq(kw("COMMENT"), $.string))
            ),

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
                kw("TABLE"),
                $.table_name,
                optional(seq(kw("ORDER BY"), $.column_name)),
                $.limit_offset_clause
            ),

        alter_table_statement: ($) =>
            seq(
                kw("ALTER TABLE"),
                $.table_name,
                commaSeparated1($.alter_option)
            ),

        alter_option: ($) =>
            choice(
                seq(
                    kw("ADD"),
                    optional(kw("COLUMN")),
                    $.identifier,
                    $.column_definition,
                    optional(choice(kw("FIRST"), seq("AFTER", $.identifier)))
                ),
                seq(
                    kw("ADD"),
                    choice(kw("INDEX"), kw("KEY")),
                    optional($.identifier),
                    optional($.index_type),
                    seq("(", commaSeparated1($.key_part), ")")
                ),
                seq(
                    kw("ADD"),
                    optional(seq(kw("CONSTRAINT"), optional($.identifier))),
                    kw("PRIMARY KEY"),
                    optional($.index_type),
                    seq("(", commaSeparated1($.key_part), ")")
                ),
                seq(
                    kw("ADD"),
                    optional(seq(kw("CONSTRAINT"), optional($.identifier))),
                    kw("UNIQUE"),
                    optional(choice(kw("INDEX"), kw("KEY"))),
                    optional($.identifier),
                    optional($.index_type),
                    seq("(", commaSeparated1($.key_part), ")")
                ),

                seq(
                    kw("CHANGE"),
                    optional(kw("COLUMN")),
                    $.identifier,
                    $.identifier,
                    $.column_definition,
                    optional(
                        choice(kw("FIRST"), seq(kw("AFTER"), $.identifier))
                    )
                ),

                seq(kw("DROP"), optional(kw("COLUMN")), $.identifier),
                seq(kw("DROP"), choice(kw("INDEX"), kw("KEY")), $.identifier),
                kw("DROP PRIMARY KEY"),

                seq(
                    kw("MODIFY"),
                    optional(kw("COLUMN")),
                    $.identifier,
                    $.column_definition,
                    optional(
                        choice(kw("FIRST"), seq(kw("AFTER"), $.identifier))
                    )
                ),

                seq(kw("RENAME COLUMN"), $.identifier, kw("TO"), $.identifier),
                seq(
                    kw("RENAME"),
                    choice(kw("INDEX"), kw("KEY")),
                    $.identifier,
                    kw("TO"),
                    $.identifier
                ),
                seq(kw("RENAME"), choice(kw("TO"), kw("AS")), $.identifier)
            ),

        key_part: ($) => $.identifier,

        index_type: ($) => seq(kw("USING"), choice(kw("BTREE"), kw("HASH"))),

        select_statement: ($) =>
            seq(
                kw("SELECT"),
                optional(choice(kw("ALL"), kw("DISTINCT"), kw("DISTINCTROW"))),
                optional(kw("HIGH PRIORITY")),
                optional(kw("STRAIGHT_JOIN")),
                $.select_expression,
                kw("FROM"),
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
                kw("UPDATE"),
                optional("LOW_PRIORITY"),
                optional("IGNORE"),
                $.table_name,
                kw("SET"),
                $.assignment_list,
                optional($.where_clause),
                optional($.order_by_clause),
                optional($.limit_clause)
            ),

        _multi_table_update_statement: ($) =>
            seq(
                kw("UPDATE"),
                optional(kw("LOW_PRIORITY")),
                optional(kw("IGNORE")),
                $.table_name,
                kw("SET"),
                $.assignment_list,
                optional($.where_clause)
            ),

        assignment_list: ($) => commaSeparated1($.assignment),

        assignment: ($) =>
            seq(
                field("column", $.column_name),
                prec.left(PREC.ASSIGNMENT, seq("=", field("value", $.value)))
            ),

        value: ($) => choice(kw("DEFAULT"), $._expression),

        delete_statement: ($) =>
            seq(
                kw("DELETE FROM"),
                $.table_name,
                $.where_clause,
                $.order_by_clause,
                $.limit_clause
            ),

        drop_table_statement: ($) =>
            seq(
                kw("DROP"),
                optional(kw("TEMPORARY")),
                kw("TABLE"),
                optional(kw("IF EXISTS")),
                $.table_name
            ),

        truncate_table_statement: ($) =>
            seq(kw("TRUNCATE"), optional(kw("TABLE")), $.table_name),

        kill_statement: ($) =>
            seq(
                kw("KILL"),
                optional(choice(kw("CONNECTION"), kw("QUERY"))),
                $.integer
            ),

        show_create_table_statement: ($) =>
            seq(kw("SHOW CREATE TABLE"), $.table_name),

        // https://dev.mysql.com/doc/refman/8.0/en/show-tables.html
        show_databases_statement: ($) =>
            seq(
                kw("SHOW"),
                choice(kw("DATABASES"), kw("SCHEMAS")),
                optional(seq(kw("LIKE"), $.like_pattern))
            ),

        show_processlist_statement: ($) =>
            seq(kw("SHOW"), optional(kw("FULL")), kw("PROCESSLIST")),

        show_tables_statement: ($) =>
            seq(
                kw("SHOW"),
                optional(kw("EXTENDED")),
                optional(kw("FULL")),
                kw("TABLES"),
                optional(seq(choice(kw("FROM"), kw("IN")), $.identifier)),
                optional(seq(kw("LIKE"), $.like_pattern))
            ),

        explain_table_statement: ($) =>
            seq(
                choice(kw("EXPLAIN"), kw("DESCRIBE"), kw("DESC")),
                choice(
                    seq(
                        $.table_name,
                        optional(choice($.identifier, $.like_pattern))
                    )
                )
            ),

        help_statement: ($) => seq(kw("HELP"), $.string),

        use_statement: ($) => seq(kw("USE"), $.database_name),

        insert_statement: ($) =>
            seq(
                kw("INSERT"),
                optional(kw("IGNORE")),
                kw("INTO"),
                $.table_name,
                choice(
                    seq(
                        $.column_list,
                        kw("VALUES"),
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

        on_duplicate_key_clause: ($) => seq(kw("ON DUPLICATE KEY UPDATE")),

        select_expression: ($) =>
            choice(
                "*",
                commaSeparated1(choice(seq($.identifier, ".", "*"), $.column))
            ),

        table_references: ($) => commaSeparated1($._table_reference),

        _table_reference: ($) => choice($.table_factor, $.joined_table),

        table_factor: ($) =>
            choice(
                seq(
                    $.table_name,
                    optional(seq(kw("PARTITION"))),
                    optional($._alias),
                    optional($.index_hint_list)
                ),
                seq(
                    optional(kw("LATERAL")),
                    "(",
                    $.table_subquery,
                    ")",
                    $._alias
                ),
                seq("(", $.table_references, ")")
            ),

        table_subquery: ($) => $.select_statement,

        joined_table: ($) =>
            choice(
                prec.left(
                    PREC.JOIN,
                    seq(
                        $._table_reference,
                        choice(
                            seq(
                                optional(choice(kw("INNER"), kw("CROSS"))),
                                kw("JOIN")
                            ),
                            kw("STRAIGHT_JOIN")
                        ),
                        $.table_factor,
                        optional($.join_specification)
                    )
                ),
                prec.left(
                    PREC.JOIN,
                    seq(
                        $._table_reference,
                        choice(kw("LEFT"), kw("RIGHT")),
                        optional(kw("OUTER")),
                        kw("JOIN"),
                        $._table_reference,
                        $.join_specification
                    )
                ),
                prec.left(
                    PREC.JOIN,
                    seq(
                        kw("NATURAL"),
                        choice(
                            kw("INNER"),
                            seq(
                                choice(kw("LEFT"), kw("RIGHT")),
                                optional(kw("OUTER"))
                            )
                        ),
                        kw("JOIN"),
                        $.table_factor
                    )
                )
            ),

        join_specification: ($) =>
            choice(
                choice(
                    seq(kw("ON"), $._expression),
                    seq(kw("USING"), "(", commaSeparated1($.identifier), ")")
                )
            ),

        index_hint_list: ($) => spaceSeparated1($.index_hint),

        index_hint: ($) =>
            choice(
                seq(
                    kw("USE"),
                    choice(kw("INDEX"), kw("KEY")),
                    optional(
                        seq(
                            kw("FOR"),
                            choice(kw("JOIN"), kw("ORDER BY"), kw("GROUP BY"))
                        )
                    ),
                    "(",
                    optional($.index_list),
                    ")"
                ),
                seq(
                    choice(kw("IGNORE"), kw("FORCE")),
                    choice(kw("INDEX"), kw("KEY")),
                    optional(
                        seq(
                            kw("FOR"),
                            choice(kw("JOIN"), kw("ORDER BY"), kw("GROUP BY"))
                        )
                    ),
                    "(",
                    $.index_list,
                    ")"
                )
            ),

        index_list: ($) => commaSeparated1($.identifier),

        column: ($) => seq($._expression, optional($._alias)),

        where_clause: ($) => seq(kw("WHERE"), $.where_condition),

        where_condition: ($) => choice($._expression),

        group_by_clause: ($) =>
            seq(
                kw("GROUP BY"),
                commaSeparated1($.column),
                optional(kw("WITH ROLLUP"))
            ),

        having_clause: ($) => seq(kw("HAVING"), $.where_condition),

        order_by_clause: ($) =>
            seq(
                kw("ORDER BY"),
                commaSeparated1(
                    seq($.column, optional(choice(kw("ASC"), kw("DESC"))))
                )
            ),

        // Limit clauses are sometimes applicable without the offset
        // clause, e.g. in delete statements
        offset_clause: ($) => seq(kw("OFFSET"), $.integer),

        limit_clause: ($) => seq(kw("LIMIT"), $.integer),

        limit_offset_clause: ($) =>
            seq($.limit_clause, optional($.offset_clause)),

        _alias: ($) => seq(optional(kw("AS")), field("alias", $.identifier)),

        call: ($) =>
            seq(
                field("function", $.identifier),
                "(",
                field("arguments", choice(commaSeparated($._expression), "*")),
                ")"
            ),

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
                $.between_expression,
                $.case_expression
            ),

        parenthesized_expression: ($) => seq("(", $._expression, ")"),

        unary_expression: ($) =>
            choice(
                ...[[kw("NOT"), PREC.NOT]].map(([operator, p]) =>
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
                        kw("IN"),
                        "(",
                        commaSeparated1($._expression),
                        ")"
                    )
                )
            ),

        like_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                choice(
                    seq($._expression, kw("LIKE"), $.like_pattern),
                    seq($._expression, kw("NOT LIKE"), $.like_pattern)
                )
            ),

        regex_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                choice(
                    seq($._expression, kw("REGEXP"), $.regex_pattern),
                    seq($._expression, kw("NOT REGEXP"), $.regex_pattern)
                )
            ),

        between_expression: ($) =>
            prec.left(
                PREC.COMPARISON,
                seq(
                    $._expression,
                    kw("BETWEEN"),
                    $._expression,
                    kw("AND"),
                    $._expression
                )
            ),

        case_expression: ($) =>
            choice(
                seq(
                    kw("CASE"),
                    $._expression,
                    repeat1(
                        seq(
                            kw("WHEN"),
                            $._expression,
                            kw("THEN"),
                            $._expression
                        )
                    ),
                    optional(seq(kw("ELSE"), $._expression)),
                    kw("END")
                ),
                seq(
                    kw("CASE"),
                    repeat1(
                        seq(
                            kw("WHEN"),
                            $._expression,
                            kw("THEN"),
                            $._expression
                        )
                    ),
                    optional(seq(kw("ELSE"), $._expression)),
                    kw("END")
                )
            ),

        interval_expression: ($) =>
            prec.left(
                PREC.INTERVAL,
                seq(kw("INTERVAL"), $._expression, $.interval_unit)
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

        // Identifiers can be quoted if keywords are used as names
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

function spaceSeparated(rule) {
    return optional(seq(rule, repeat(seq(" ", rule))));
}

function spaceSeparated1(rule) {
    return seq(rule, repeat(seq(" ", rule)));
}

function withDisplayWidth($, rule) {
    return seq(rule, optional(seq("(", $.integer, ")")));
}

function caseInsensitive(value) {
    return new RegExp(
        value
            .split("")
            .map((letter) => `[${letter.toLowerCase()}${letter.toUpperCase()}]`)
            .join("")
    );
}

// Create a case insensitive keyword
//
// Using the alias function, the regex rule for each keyword is given a simple
// name in the tree that can be used for highlighting, without making a named
// node for each keyword.
function kw(keyword) {
    if (keyword.toUpperCase() != keyword) {
        throw new Error(`Expected upper case keyword got ${keyword}`);
    }

    const words = keyword.split(" ");
    const regExps = words.map(caseInsensitive);

    if (regExps.length == 1) {
        return alias(regExps[0], keyword);
    } else {
        return alias(seq(...regExps), keyword.replace(/ /g, "_"));
    }
}
