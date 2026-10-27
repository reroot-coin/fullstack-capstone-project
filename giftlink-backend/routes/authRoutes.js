const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger

const logger = pino();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try{
        const db = await connectToDatabase();
        const collection = await db.collection('users');
        const existing = await collection.findOne({ email: req.body.email });

        if(existing){
            return res.status(400).json({message: 'Email already exists'});
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;

        const newUser = await collection.insertOne({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hash,
            createAt: new Date(),
        });

        let payload = {
            user: {
                id: newUser.insertedId,
            }
        }
        const authToken = jwt.sign(payload, JWT_SECRET)
        logger.info(`User registered successfully!`);
        return res.status(201).json({authToken, email});
    }catch (e) {
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try{
        const db = await connectToDatabase();
        const collection = await db.collection('users');
        const existingUser = await collection.findOne({ email: req.body.email });

        if(!existingUser){
            logger.error('User not found');
            return res.status(404).json({message: 'USER NOT FOUND'});
        }else {
            let result = await bcryptjs.compare(req.body.password, existingUser.password);
            if(!result){
                logger.error('Password doesn\'t match');
                return res.status(404).json({message: 'Wrong password'});
            }

            const userName = existingUser.Firstname;
            const userEmail = existingUser.email;

            let payload = {
                id: existingUser._id.toString(),
            };

            const authToken = jwt.sign(payload, JWT_SECRET);
            logger.info(`User logged in successfully!`);
            return res.status(200).json({authToken, userName, userEmail});
        }
    }catch (e) {
        return res.status(500).send('Internal server error');
    }
})
module.exports = router;