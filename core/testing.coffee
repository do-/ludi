class Assert

    constructor: () ->
    ok: (condition, message, details) ->
        say sprintf "%-60sok", message, condition
        return if condition
        throw new Error(details)
    equal:    (actual, expected, message) -> @ok( eq(actual, expected), message, "#{json actual} != #{json expected}")
    notEqual: (actual, expected, message) -> @ok(!eq(actual, expected), message, "#{json actual} == #{json expected}")

assert = new Assert
assert.deepEqual = assert.equal
