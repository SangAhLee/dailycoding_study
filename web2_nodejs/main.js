var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, datalist, body) {
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
        <a href="/create">create</a>
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

  console.log('(1)');
  console.log(url.parse(_url, true));

  if (pathname === '/') {
    if (queryData.id === undefined) {
      title = 'Welcome';
      description = 'Hello, Node.js!';
      console.log('(2) description: ' + description + '\n');


      fs.readdir('./data', function(err, filelist) {
        console.log('(3) filelist : ' + filelist + '\n');

        var datalist = templateList(filelist);
        console.log('(4) datalist: ' + datalist + '\n');

        /*
        var list = `<ul>


          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ul>`;
        */

        var body = `<h2>${title}</h2>${description}`;
        var template = templateHTML(title, datalist, body);
        response.writeHead(200);
        response.end(template);
      });
    } else {
      title = queryData.id;
      fs.readFile(`./data/${title}`, 'utf8', function(err, data) {
        description = data;
        console.log('(2) description: ' + `data = ${data}` + '\n');

        fs.readdir('./data', function(err, filelist) {
          console.log('(3) filelist : ' + filelist + '\n');
          var datalist = templateList(filelist);
          console.log('(4) datalist: ' + datalist + '\n');

          var body = `<h2>${title}</h2>${description}`;
          var template = templateHTML(title, datalist, body);
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === '/create') {

    title = 'Web - creat';
    description = 'Hello, Node.js!';
    console.log('(2) description: ' + description + '\n');


    fs.readdir('./data', function(err, filelist) {
      console.log('(3) filelist : ' + filelist + '\n');

      var datalist = templateList(filelist);
      console.log('(4) datalist: ' + datalist + '\n');
      var body = `<form action="http://localhost:5000/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
`;
      var template = templateHTML(title, datalist, body);
      response.writeHead(200);
      response.end(template);
    });


  } else if (pathname === '/create_process') {

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

      fs.writeFile(`./data/${title}`, description, 'utf8', (err)=> {
        if(err) throw err;
        console.log('The file has been saved!');
        response.writeHead(301, {Location: `/?id=${title}`});
        response.end('success');
      });

    });

  } else {
    response.writeHead(404);
    response.end('Not found');
  }
  console.log('----------------------------------');
});

app.listen(5000);
