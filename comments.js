// Create web server

// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var qs = require('querystring');
var db = require('./db');
var template = require('./template');

var server = http.createServer(function (request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url, true).query;

    if (pathname === '/') {
        db.query('SELECT * FROM topic', function (err, topics) {
            var title = 'Welcome';
            var description = 'Hello, Node.js';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<h2>${title}</h2>${description}`,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create') {
        db.query('SELECT * FROM topic', function (err, topics) {
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list, `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `);
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query(
                `INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
                [post.title, post.description, 1],
                function (err, result) {
                    if (err) {
                        throw err;
                    }
                    response.writeHead(302, { Location: `/?id=${result.insertId}` });
                    response.end();
                }
            );
        });
    } else if (pathname === '/update') {
        db.query('SELECT * FROM
