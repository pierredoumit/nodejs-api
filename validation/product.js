const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProduct(data) {
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';

    if (Validator.isEmpty(data.name)) {
        errors.email = 'Product name is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
