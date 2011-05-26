type ?= {}

get_request_handler_function_by_request = (r) ->
    t = type[r.type];
    if !t
        throw "Unknown type: " + r.type
    if (!r.action)
        return if r.id then t.get else t.select
    f = t[r.action]
    if (!f)
        throw new Error "Unknown action " + r.action + " for type: " + r.type
    f

get_result_object_in_context = () ->
    get_request_handler_function_by_request(@REQUEST).apply @

get_result_object_by_context = (context) ->
    a = [null, null]
    try
        a[0] = get_result_object_in_context.apply context
    catch e
        if e instanceof Error
            e = {message:e.message, stack:e.stack}
        a[1] = e
    a

get_result_text_by_context_for_content_type =

    'application/json': (context) -> json get_result_object_by_context context

    'text/html': (context) -> "<html><head><script>var a=#{json get_result_object_by_context context}</script></head><body onLoad='window.parent.ludi.receive(a)'></body>"

get_content_type_by_context = (context) -> 'application/json'

get_result_text_by_context = (context) -> get_result_text_by_context_for_content_type[get_content_type_by_context context](context)