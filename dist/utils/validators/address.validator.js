"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddressRules = exports.getAddressDetailsRules = exports.updateAddressRules = exports.createAddressRules = void 0;
const express_validator_1 = require("express-validator");
const validation_utils_1 = require("./validation.utils");
const createAddressRules = () => [
    (0, express_validator_1.body)('alias').notEmpty().withMessage(validation_utils_1.ERROR_MESSAGES.address.alias.required).trim(),
    (0, validation_utils_1.nameRule)('recipientName').trim(),
    (0, validation_utils_1.cepRule)(),
    (0, express_validator_1.body)('street').notEmpty().withMessage(validation_utils_1.ERROR_MESSAGES.address.street.required).trim(),
    (0, express_validator_1.body)('number').notEmpty().withMessage(validation_utils_1.ERROR_MESSAGES.address.number.required).trim(),
    (0, express_validator_1.body)('neighborhood').notEmpty().withMessage(validation_utils_1.ERROR_MESSAGES.address.neighborhood.required).trim(),
    (0, express_validator_1.body)('city').notEmpty().withMessage(validation_utils_1.ERROR_MESSAGES.address.city.required).trim(),
    (0, validation_utils_1.stateRule)(),
    (0, validation_utils_1.phoneRule)(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.ADDRESS),
];
exports.createAddressRules = createAddressRules;
const updateAddressRules = () => [
    (0, validation_utils_1.mongoIdRule)('addressId', validation_utils_1.ERROR_MESSAGES.address.id.invalid).bail(),
    (0, validation_utils_1.cepRule)().optional(),
    (0, validation_utils_1.stateRule)().optional(),
    (0, express_validator_1.body)('alias')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.address.alias.required)
        .trim(),
    (0, validation_utils_1.nameRule)('recipientName').optional().trim(),
    (0, express_validator_1.body)('street')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.address.street.required)
        .trim(),
    (0, express_validator_1.body)('number')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.address.number.required)
        .trim(),
    (0, express_validator_1.body)('neighborhood')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.address.neighborhood.required)
        .trim(),
    (0, express_validator_1.body)('city')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(validation_utils_1.ERROR_MESSAGES.address.city.required)
        .trim(),
    (0, validation_utils_1.phoneRule)().optional(),
    (0, validation_utils_1.fieldWhitelistRule)(validation_utils_1.ALLOWLISTS.ADDRESS),
];
exports.updateAddressRules = updateAddressRules;
const getAddressDetailsRules = () => [
    (0, validation_utils_1.mongoIdRule)('addressId', validation_utils_1.ERROR_MESSAGES.address.id.invalid),
];
exports.getAddressDetailsRules = getAddressDetailsRules;
const deleteAddressRules = () => [
    (0, validation_utils_1.mongoIdRule)('addressId', validation_utils_1.ERROR_MESSAGES.address.id.invalid),
];
exports.deleteAddressRules = deleteAddressRules;
