import axios from "axios";

//这里是axios请求的接口
export function home(){
    return axios({
        method:'get',
        url:`${process.env.VUE_APP_BASE_URL}/book/home`
    })
}