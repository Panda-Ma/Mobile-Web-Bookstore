import {createStore} from 'vuex'
import book from './modules/book'
import getters from './getters'
import actions from "@/store/actions";

export default createStore({
    state: {},
    getters,
    mutations: {},
    actions,
    modules: {
        book
    }
})
