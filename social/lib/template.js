module.exports = {
  HTML:(body, control,authStatusUI = `<a href="/auth/login">login</a> | <a href="/auth/register">REGISTER</a>`)=>{
    return `
    <!doctype html>
    <html>
    <head>
    </head>
    <body>
      ${authStatusUI}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
}
