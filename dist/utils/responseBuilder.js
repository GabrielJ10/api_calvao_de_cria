"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseBuilder {
    constructor() {
        this.response = {
            status: 'success',
        };
    }
    withStatus(status) {
        this.response.status = status;
        return this;
    }
    withMessage(message) {
        this.response.message = message;
        return this;
    }
    withData(data) {
        this.response.data = data;
        return this;
    }
    withPagination({ totalItems, totalPages, currentPage, limit, }) {
        this.response.pagination = { totalItems, totalPages, currentPage, limit };
        return this;
    }
    withDetails(details) {
        this.response.details = details;
        return this;
    }
    withExtra(key, value) {
        this.response[key] = value;
        return this;
    }
    build() {
        const cleanResponse = {};
        for (const [key, value] of Object.entries(this.response)) {
            if (value !== null && value !== undefined) {
                cleanResponse[key] = value;
            }
        }
        return cleanResponse;
    }
}
exports.default = ResponseBuilder;
