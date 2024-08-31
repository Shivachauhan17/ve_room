"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log the error for debugging purposes
    // Check if the error is a MongoDB CastError (invalid ID format)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    // Handle other types of errors
    return res.status(500).json({ error: 'Internal server error' });
}
