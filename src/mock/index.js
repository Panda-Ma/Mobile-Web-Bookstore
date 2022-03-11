import Mock from 'mockjs'
import home from './bookHome'
import shelf from './bookShelf'
import list from './bookList'
import flatList from './bookFlatList'


//第一个参数 正则表达式：匹配的url
//第二个参数 请求方式
//第三个参数 请求的数据
Mock.mock(/\/book\/home/, 'get', home)
Mock.mock(/\/book\/shelf/, 'get', shelf)
Mock.mock(/\/book\/list/, 'get', list)
Mock.mock(/\/book\/flat-list/, 'get', flatList)
