export default function tryCatchWrapper(fn) {
    return async function(...args) {
        return Promise.resolve(fn.call(this,...args)).catch(err => console.log(err))
    }
}