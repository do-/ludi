url          = require 'url'
formidable   = require '/usr/local/lib/node_modules/formidable'
http         = require 'http'

server       = null

class Server

    sendResponse: (res, content) ->
        res.setHeader "Content-Length", content.length
        res.writeHead 200, {'Content-Type': 'application/json'}
        res.end content

    GET: (req, res) ->
        context =
            REQUEST: url.parse(req.url, true).query
        @sendResponse res, get_result_json_by_context(context)

    POST: (req, res) ->
        context = null
        parser = (err, fields, files) ->
            context =
                REQUEST: fields
                FILES:   files
        finalizer = () -> @sendResponse(res, get_result_json_by_context(context))
        new formidable.IncomingForm().parse(req, parser).on('end', finalizer)

    handler: (req, res) -> @the_server[req.method](req, res)

    start: () ->
        s = http.createServer @handler
        s.the_server = @
        s.listen 80