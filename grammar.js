// Operator precedence
//
// Lower values indicate .
//
// https://dev.mysql.com/doc/refman/8.0/en/operator-precedence.html
const PREC = {
    MULTIPLICATION: 12, // *, /, DIV, %, MOD
    ADDITION: 11, // -, +
    BITSHIFT: 10, // <<, >>
    BITWISE_AND: 9, // &
    BITWISE_OR: 8, // |
    COMPARISON: 7, // = (comparison), <=>, >=, >, <=, <, <>, !=, IS, LIKE, REGEXP, IN, MEMBER OF
    NOT: 6,
    AND: 5, // AND, &&
    XOR: 4,
    OR: 3, // OR, ||
    ASSIGNMENT: 2 // :=
};

// Make a keyword
function keyword(word) {
    return word;
}

module.exports = grammar({
    name: 'mysql',

    rules: {
        source_file: $ => repeat($.statement),

        statement: $ => seq(
            choice(
                $.select_statement,
                $.update_statement,
                $.delete_statement,
                $.create_table_statement,
            ),
            optional(";")
        ),

        create_table_statement: $ => seq(
            keyword('CREATE TABLE')
        ),

        // Select statement
        // https://dev.mysql.com/doc/refman/8.0/en/select.html
        select_statement: $ => seq(
            keyword('SELECT'),
            $.select_expression,
            keyword('FROM'),
            $.table_references,
            optional($.where_clause),
            optional($.group_by_clause),
            optional($.having_clause),
            optional($.order_by_clause),
            optional($.limit_offset_clause)
        ),

        update_statement: $ => seq(
            keyword('UPDATE'),
            // $.table_name,
            keyword('SET'),
            $.where_clause,
            $.order_by_clause,
            $.limit_clause
        ),

        // Delete statement
        // https://dev.mysql.com/doc/refman/8.0/en/delete.html
        delete_statement: $ => seq(
            keyword('DELETE FROM'),
            // $.table_name,
            $.where_clause,
            $.order_by_clause,
            $.limit_clause
        ),

        select_expression: $ => choice(
            "*",
            commaSeparated1((
                choice(
                    seq($.identifier, ".", "*"),
                    $.column
                )
            ))
        ),

        table_references: $ => choice(
            seq(
                $.identifier,
                optional($._alias)
            ),
            seq(
                "(",
                $.select_statement,
                ")",
                $._alias
            )
        ),

        join_clause: $ => seq(

        ),

        column: $ => seq(
            choice(
                $._literal,
                $.call,
                $._field),
            optional($._alias)
        ),

        where_clause: $ => seq(
            keyword('WHERE'),
            $.where_condition
        ),

        where_condition: $ => choice(
            $._expression
        ),

        group_by_clause: $ => seq(
            keyword('GROUP BY'),
            commaSeparated1(
                $.column
            ),
            optional(keyword('WITH ROLLUP'))
        ),

        having_clause: $ => seq(
            keyword('HAVING'),
            $.where_condition
        ),

        order_by_clause: $ => seq(
            keyword('ORDER BY'),
            commaSeparated1(
                seq(
                    $.column,
                    optional(choice('ASC', 'DESC'))
                )
            )
        ),

        // Limit clauses are sometimes applicable without the offset
        // clause, e.g. in delete statements
        offset_clause: $ => seq(
            keyword("OFFSET"),
            $.integer
        ),

        limit_clause: $ => seq(
            keyword("LIMIT"),
            $.integer
        ),

        limit_offset_clause: $ => seq(
            $.limit_clause,
            optional($.offset_clause)
        ),

        // Basic components used as building block in many types of
        // statements and expressions.

        // Alias can be used without the explicit AS
        _alias: $ => seq(
            optional(keyword("AS")),
            field('alias', $.identifier)
        ),

        call: $ => seq(
            field('function', $.identifier),
            "(",
            optional(field('arguments', $.identifier)),
            ")"
        ),

        // Operators
        // https://dev.mysql.com/doc/refman/8.0/en/non-typed-operators.html
        _expression: $ => choice(
            $.parenthesized_expression,
            $._literal,
            $.call,
            $.identifier,
            $.unary_expression,
            $.binary_expression,
        ),

        parenthesized_expression: $ => seq(
            "(",
            $._expression,
            ")"
        ),

        unary_expression: $ => choice(
            ...[
                ['NOT', PREC.NOT],
            ].map(([operator, p]) => prec.left(p, seq(
                field('operator', operator),
                field('value', $._expression))))),

        binary_expression: $ => choice(
            ...[
                ['*', PREC.MULTIPLICATION],
                ['/', PREC.MULTIPLICATION],
                ['%', PREC.MULTIPLICATION],
                ['-', PREC.ADDITION],
                ['+', PREC.ADDITION],
                ['<<', PREC.BITSHIFT],
                ['>>', PREC.BITSHIFT],
                ['&', PREC.BITWISE_AND],
                ['|', PREC.BITWISE_OR],
                ['=', PREC.COMPARISON],
                ['<=>', PREC.COMPARISON],
                ['>=', PREC.COMPARISON],
                ['>', PREC.COMPARISON],
                ['<=', PREC.COMPARISON],
                ['<', PREC.COMPARISON],
                ['<>', PREC.COMPARISON],
                ['!>', PREC.COMPARISON],
                ['IS', PREC.COMPARISON],
                ['AND', PREC.AND],
                ['&&', PREC.AND],
                ['XOR', PREC.XOR],
                ['OR', PREC.OR],
                ['||', PREC.OR],
            ].map(([operator, p]) => prec.left(p, seq(
                field('left', $._expression),
                field('operator', operator),
                field('right', $._expression),
            )))),

        _field: $ => seq(
            // optional(seq(
            //     $.identifier, ","
            // )),
            $.identifier
        ),

        // Identifiers can quoted if keywords are used as names
        identifier: $ => choice(
            $._identifier,
            seq(
                '`',
                $._identifier,
                '`'
            )
        ),
        _identifier: $ => /[a-zA-Z][0-9a-zA-Z_]*/,

        // Literals
        // https://dev.mysql.com/doc/refman/8.0/en/literals.html
        _literal: $ => choice(
            $.string,
            $.integer,
            $.hex,
            $.bit,
            $.true,
            $.false,
            $.NULL
        ),

        string: $ => choice(
            /'[^']*'/,
            /"[^']*"/
        ),

        integer: $ => /-?\d+/,

        hex: $ => choice(
            /0x[0-9a-fA-F]+/,
            /(x|X)'[0-9a-fA-F]+'/
        ),

        bit: $ => choice(
            /0b[01]+/,
            /(b|B)'[01]+'/
        ),

        true: $ => 'true',

        false: $ => 'false',

        NULL: $ => 'NULL'
    }
});

function commaSeparated(rule) {
    return optional(seq(
        rule,
        repeat(seq(",", rule))
    ))
}

function commaSeparated1(rule) {
    return seq(rule, repeat(seq(",", rule)))
}
