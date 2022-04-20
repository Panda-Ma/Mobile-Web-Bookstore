// 如果有指定url的请求，映射本地的资源，并返回
// 第一个参数 app 本地服务器
// 第二个参数 是对应的本地链接，本地服务器地址会默认添加到之前（本地服务器地址加上该url可以在浏览器查看数据）
// 第三个参数是该链接对应的本地数据
function mock(app, url, data) {
    app.get(url, (request, response) => {
        response.json(data)
    })
}

const homeData = require('./src/mock/bookHome')
const shelfData = require('./src/mock/bookShelf')
const listData = require('./src/mock/bookList')
const flatListData = require('./src/mock/bookFlatList')


module.exports = {
    devServer: {
        before(app) {
            mock(app, '/book/home', homeData)
            mock(app, '/book/shelf', shelfData)
            mock(app, '/book/list', listData)
            mock(app, '/book/flat-list', flatListData)
        },

        proxy: {                //配置代理服务器来解决跨域问题
            '/api': {
                target: 'http://192.168.101.134:8081',      //配置要替换的后台接口地址
                changOrigin: true,                      //配置允许改变Origin
                pathRewrite: {
                    '^/api': '/epub'
                }
            },
        },
    },
    configureWebpack: {
        performance: {
            hints: 'warning', //针对警告信息，如果为false则不会提示警告
            maxAssetSize: 524 * 1024,
            maxEntrypointSize: 524 * 1024,
        }
    }
}