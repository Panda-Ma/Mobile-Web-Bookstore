/**
 * 这里利用vue-i18n实现了国际语言的切换
 */
import {createI18n} from 'vue-i18n'


import en from './en'
import cn from "@/lang/cn";
import {getLocale, saveLocale} from "@/utils/localStorage";


const messages={
    en,
    cn
}
let locale=getLocale()
if(!locale){
    window.alert(locale)
    locale='cn'
    saveLocale(locale)
}

const i18n= createI18n({
    locale,
    messages
})

export default i18n