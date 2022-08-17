// 如果有指定url的请求，映射本地的资源，并返回
// 第一个参数 app 本地服务器
// 第二个参数 是对应的本地链接，本地服务器地址会默认添加到之前（本地服务器地址加上该url可以在浏览器查看数据）
// 第三个参数是该链接对应的本地数据
function getMockData(app, url, data) {
    app.get(url, (request, response) => {
        response.json(data)
    })
}

function getDetailData(app, url, data) {
    app.get(url, async (request, response) => {
        const fileName = request.query.fileName

        const handleData = (data) => {
            return new Promise((resolve) => {
                let arr = Object.values(data).filter(ele => {
                    return ele.fileName === fileName;
                })
                if (arr.length > 0) resolve(arr[0])
                else resolve(null)
            })
        }
        let detail = await handleData(data)
        if (detail === null) {
            response.json({
                error_code: 1,
                msg: '电子书详情获取失败'
            })
        } else {
            if (!detail.cover.startsWith('http://')) {
                detail['cover'] = `${process.env.VUE_APP_IMG_URL}/${detail.cover}`
            }
            detail['selected'] = false
            detail['private'] = false
            detail['cache'] = false
            detail['haveRead'] = 0

            response.json({
                error_code: 0,
                msg: '获取成功',
                data: detail
            })
        }
    })

}

const homeData = require('./src/mock/bookHome')
const shelfData = require('./src/mock/bookShelf')
const listData = require('./src/mock/bookList')
const flatListData = require('./src/mock/bookFlatList')
const detailData = require('./src/mock/bookDetail')


module.exports = {
    devServer: {
        host: '127.0.0.1', // 0.0.0.0为对所有开放
        port: 8080,  //指定项目的启动端口
        before(app) {
            getMockData(app, '/book/home', homeData)
            getMockData(app, '/book/shelf', shelfData)
            getMockData(app, '/book/list', listData)
            getMockData(app, '/book/flat-list', flatListData)
            getDetailData(app, '/book/detail', detailData)
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