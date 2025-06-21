// In a broad sense tryCatchWrapper and asyncReqHandler are same
// they both use similar strategies to handle errors
// how ever this function works with pre middleware, only when i am returning the values
// pre middleware needs a function that returns a function, if we are omitting return then it will not return anything 
// hence it will not work for pre middlewares

export default function tryCatchWrapper(fn) {
    return async function(...args) {
        return Promise.resolve(fn.call(this,...args)).catch(err => {
            console.log(err)
            throw err
        })
    }
}