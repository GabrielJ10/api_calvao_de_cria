const checkoutService = require('../services/checkout.service');
const asyncHandler = require('../utils/asyncHandler');
const ResponseBuilder = require('../utils/responseBuilder');

const getPaymentMethods = asyncHandler(async (req, res, next) => {
    const result = await checkoutService.getPaymentMethods();
    const response = new ResponseBuilder()
        .withStatus('success')
        .withData(result.data)
        .build();
    res.status(200).json(response);
});

const previewCoupon = asyncHandler(async (req, res, next) => {
    const { couponCode } = req.body;
    const result = await checkoutService.previewCoupon(req.user.id, couponCode);
    const response = new ResponseBuilder()
        .withStatus('success')
        .withData(result.data)
        .build();
    res.status(200).json(response);
});

const createOrder = asyncHandler(async (req, res, next) => {
    const result = await checkoutService.createOrder(req.user.id, req.body);
    const response = new ResponseBuilder()
        .withStatus('success')
        .withMessage(result.message)
        .withData(result.data)
        .build();
    res.status(201).json(response);
});

module.exports = {
    getPaymentMethods,
    previewCoupon,
    createOrder,
};