// Local CSS build; runtime browsers never need Tailwind JavaScript.
module.exports = {
    content: [__dirname + '/index.html', __dirname + '/assets/*.js'],
    theme: { extend: { fontFamily: { sans: ['Tajawal', 'sans-serif'] } } },
    plugins: []
};
