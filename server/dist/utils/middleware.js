"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.unknownEndpoint = exports.requestLogger = void 0;
const logger_1 = require("./logger");
const requestLogger = (request, response, next) => {
    (0, logger_1.info)('Method:', request.method);
    (0, logger_1.info)('Path:  ', request.path);
    (0, logger_1.info)('Body:  ', request.body);
    (0, logger_1.info)('---');
    next();
};
exports.requestLogger = requestLogger;
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
exports.unknownEndpoint = unknownEndpoint;
const errorHandler = (err, request, response, next) => {
    (0, logger_1.error)(err.message);
    if (err.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }
    else if (err.name === 'ValidationError') {
        return response.status(400).json({ error: err.message });
    }
    next(logger_1.error);
};
exports.errorHandler = errorHandler;
