class ErrorResponse extends Error { //extending the error class to receive our statusCode

    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }

}

module.exports = ErrorResponse