export default function asyncReqHandler(fn) {
    return async function (req,res,next) {
        return Promise.resolve(fn(req,res,next)).catch(err => next(err) )
    }
}

