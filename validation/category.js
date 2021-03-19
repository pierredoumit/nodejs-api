const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCategory(data) {
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';

    if (Validator.isEmpty(data.name)) {
        errors.email = 'Category name is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
