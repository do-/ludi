type ?= {}

get_request_handler_function_by_request = (r) ->
    t = type[r.type];
    if !t
        throw "Unknown type: " + r.type
    if (!r.action)
        return if r.id then t.get else t.select
    f = t[r.action]
    if (!f)
        throw "Unknown action " + r.action + " for type: " + r.type
    f

get_result_object_in_context = () ->
    get_request_handler_function_by_request(@REQUEST).apply @

get_result_json_by_context = (context) ->
    a = [null, null]
    try
        a[0] = get_result_object_in_context.apply context
    catch e
        a[1] = e
    json a