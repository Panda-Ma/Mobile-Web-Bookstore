import axios from "axios";
import {setLocalForage} from "@/utils/localForage";

//home、shelf、detail三个方法分别为3个页面的初始化
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
        url: `${process.env.VUE_APP_BASE_URL}/book/detail`,
        params: {
            fileName: book.fileName
        }
    })
}

export function list() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/list` //mock接口
    })
}
//第一个参数是书籍，其他三个是回调函数
export function download(book, onSuccess, onError, onProgress) {
    //当没有OnProgress
    if (onProgress == null) {
        onProgress = onError
        onError = null
    }
    //create返回一个axios实例
    return axios.create({
        baseURL: process.env.VUE_APP_EPUB_URL,
        method: 'get',
        responseType: 'blob',
        timeout: 180 * 1000,
        //进度计算，返回给客户端
        onDownloadProgress: progressEvent => {
            if (onProgress) onProgress(progressEvent)
        }
    }).get(`${book.categoryText}/${book.fileName}.epub`)
        .then(res => {
            const blob = new Blob([res.data])
            //传入两个回调函数并保存IndexDB
            setLocalForage(book.fileName, blob,
                () => {
                    if (onSuccess) onSuccess(book)
                },
                err => {
                    if (onError) onError(err)
                }
            )
        })
        .catch(err => {
            if (onError) onError(err)
        })
}

export function flatList() {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/flat-list` //本来是 VUE_APP_BOOK_URL=http://47.99.166.157:3000
    })
}