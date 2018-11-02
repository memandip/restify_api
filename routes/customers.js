const errors = require('restify-errors');
const Customer = require('../models/Customer');
const config = require('../config');
const rjwt = require('restify-jwt-community');

module.exports = server => {

    // Get customers
    server.get('/customers', async (req, res, next) => {
        
        try{
            const customers = await Customer.find({}); 
            res.send(customers);
            next();
        }   catch(err){
            return next(new errors.InvalidContentError(err));   
        }
    });

    // Add customer
    server.post('/customers', async (req, res, next) => {
        if(! req.is('application/json')){
            return next(errors.InvalidContentError("Expects 'application/json'"));
        }

        const { name, email, balance } = req.body;

        const customer = new Customer({
            name,
            email,
            balance
        });

        try{
            await customer.save();
            res.send(201);
        }   catch(err){
            return next(errors.InternalError(err.message));
        }

    });

    // protected route
    server.get('/customer/:id', rjwt({ secret: config.JWT_SECRET}) ,async (req,res, next) => {
        try{
            const customer = await Customer.findOne({_id: req.params.id}, req.body);
            res.send(customer);
            next();
        }   catch(err){
            return next(errors.ResourceNotFoundError(
                `There is no customer with id ${req.params.id}`
            ));
        }
    });

    // update customer
    server.put('/customer/:id', async (req,res, next) => {
        try{
            await Customer.findOneAndUpdate({_id: req.params.id}, req.body);
            res.send(200);
            next();
        }   catch(err){
            return next(errors.ResourceNotFoundError(
                `There is no customer with id ${req.params.id}`
            ));
        }
    });

    // delete customer
    server.del('/customer/:id', async (req,res, next) => {
        try{
            await Customer.findOneAndRemove({_id: req.params.id}, req.body);
            res.send(204);
            next();
        }   catch(err){
            return next(errors.ResourceNotFoundError(
                `There is no customer with id ${req.params.id}`
            ));
        }
    });


}