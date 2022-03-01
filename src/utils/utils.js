
export function px2rem(px) {
    const ratio = 375 / 10
    return px / ratio
}

//根据屏幕缩放比例，计算出真实的px
export function realPx(px) {
    const maxWidth = window.innerWidth > 500 ? 500 : window.innerWidth
    return px * (maxWidth / 375)
}