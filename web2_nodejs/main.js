var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, datalist, control, body) {
  var template = `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${datalist}
        ${control}
        ${body}
      </body>
      </html>
      `;
  return template;
}

function templateList(filelist) {
  var datalist = '<ul>';
  var i = 0;
  while (i < filelist.length) {
    datalist = datalist + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  datalist = datalist + '</ul>';
  return datalist;
}


var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  var title = 'title undefined';
  var description = 'description undefined';

  console.log('----------START----------');
  console.log(url.parse(_url, true));
  console.log(queryData);

  if (pathname === '/') {
    if (queryData.id === undefined) {
      title = 'Welcome';
      description = 'Hello, Node.js!';

      fs.readdir('./data', function(err, filelist) {
        var datalist = templateList(filelist);
        /*
        var list = `<ul>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ul>`;
        */
        var control = `<a href="/create">create</a>`;
        var body = `<h2>${title}</h2>${description}`;
        var template = templateHTML(title, datalist, control, body);
        response.writeHead(200);
        response.end(template);
      });
    } else {
      title = queryData.id;
      fs.readFile(`./data/${title}`, 'utf8', function(err, data) {
        description = data;

        fs.readdir('./data', function(err, filelist) {
          var datalist = templateList(filelist);
          var control = `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`;
          var body = `<h2>${title}</h2>${description}`;
          var template = templateHTML(title, datalist, control, body);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === '/create') {
    title = 'create';

    fs.readdir('./data', function(err, filelist) {
      var datalist = templateList(filelist);
      var body = `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>`;
      var template = templateHTML(title, datalist, ' ', body);
      response.writeHead(200);
      response.end(template);
    });


  } else if (pathname === '/create_process') {
    title = 'create_process';
    var body = '';
    request.on('data', function(data) {
      body += data;
      //Too much POST data, kill the connection
      // 1e6==1*Math.pow(10,6) === 1*1000000~~~1MB
      /*  if(body.length >1e6) {
          request.connection.destroy();
        }
        */
    });
    request.on('end', function() {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      console.log(post);
      // post['blah']

      fs.writeFile(`./data/${title}`, description, 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
        response.writeHead(301, {
          Location: `/?id=${title}`
        });
        response.end('success');
      });

    });

  } else if (pathname === '/update') {

    title = queryData.id;
    console.log("pathname update!1");
    fs.readdir('./data', function(err, filelist) {
      var datalist = templateList(filelist);

      console.log("pathname update!2");

      fs.readFile(`data/${title}`, 'utf8', function(err, description) {
        console.log(`${title} + ${description}`);

        var body = `<form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `;
        var template = templateHTML(title, datalist, ' ', body);
        response.writeHead(200);
        response.end(template);
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

  console.log('----------END----------');
});

app.listen(5000);
