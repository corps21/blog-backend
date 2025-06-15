const {connect} = require('mongoose')

function connectDb(url) {
    return () => {
        return connect(url)
    }
}

module.exports = connectDb