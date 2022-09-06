module.exports = {
  HTML:(body, control,authStatusUI)=>{
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
