const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        qury: './src/js/qury.js',
        addrmv: './src/js/addrmv.js',
        contact: './src/js/contact.js',
        main: './src/js/main.js',
        shop: './src/js/shop.js',
        shopcart: './src/js/shopcart.js',
        orders: './src/js/orders.js',
        about: './src/js/abt.js',
        bookmark: './src/js/bookmark.js',
        admin: './src/js/admin.js',
        adminsorder: './src/js/adminsorder.js',
        comments: './src/js/comments.js'


    },
    output: {
        path: path.resolve(__dirname, 'bundle-js'),
        filename: '[name].bundle.js'
    },
    watch: true
};