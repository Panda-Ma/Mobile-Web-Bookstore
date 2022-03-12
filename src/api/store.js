import axios from "axios";

//这里是axios请求的接口
export function home() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/home` //mock接口
    })
}
export function shelf() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/shelf`
    })
}

export function detail(book) {
    return axios({
        method: 'get',
        //请求线上的api接口 书籍详情页的信息
        url: `${process.env.VUE_APP_BOOK_URL}/book/detail`,
        params: {
            fileName: book.fileName
        }
    })
}

export function list() {
    return axios({
        method: 'get',
        url:`${process.env.VUE_APP_BASE_URL}/book/list` //mock接口
    })
}