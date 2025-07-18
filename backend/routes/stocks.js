const express = require('express');
const {
    getStocks,
    getStock,
    createStock,
    updateStock,
    deleteStock
} = require('../controllers/stocks');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getStocks)
    .post(createStock);

router
    .route('/:id')
    .get(getStock)
    .put(updateStock)
    .delete(deleteStock);

module.exports = router;
