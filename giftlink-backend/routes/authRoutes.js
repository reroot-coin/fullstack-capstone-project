const express = require('express');
const app = express();
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

        const payload = {
            user: {
                id: newUser.insertedId,
            }
        }
        const authToken = jwt.sign(payload, JWT_SECRET)
        logger.info(`User registered successfully!`);
        return res.json({authToken, email});
    }catch (e) {
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;