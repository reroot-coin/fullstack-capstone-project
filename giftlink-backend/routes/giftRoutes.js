/*jshint esversion: 8 */
const connectToDatabase = require("../models/db");
/*jshint esversion: 8 */
const router = require('express').Router();

/*jshint esversion: 8 */
router.get('/', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        /*jshint esversion: 8 */
        const db = await connectToDatabase();

        // Task 2: use the collection() method to retrieve the gift collection
        /*jshint esversion: 8 */
        const collection = db.collection("gifts");

        // Task 3: Fetch all gifts using the collection.find method. Chain with toArray method to convert to JSON array
        /*jshint esversion: 8 */
        const gifts = await collection.find({}).toArray();

        // Task 4: return the gifts using the res.json method
        res.status(200).json(gifts);
    } catch (e) {
        console.error('Error fetching gifts:', e);
        res.status(500).send('Error fetching gifts');
    }
});

/*jshint esversion: 8 */
router.get('/:id', async (req, res) => {
    try {
        // Task 1: Connect to MongoDB and store connection to db constant
        /*jshint esversion: 8 */
        const db = await connectToDatabase();

        // Task 2: use the collection() method to retrieve the gift collection
        /*jshint esversion: 8 */
        const collection = db.collection('gifts');

        /*jshint esversion: 8 */
        const id = req.params.id;

        // Task 3: Find a specific gift by ID using the collection.fineOne method and store in constant called gift
        /*jshint esversion: 8 */
        const gift = await collection.findOne({id: id});

        if (!gift) {
            return res.status(404).send('Gift not found');
        }

        res.status(200).json(gift);
    } catch (e) {
        console.error('Error fetching gift:', e);
        res.status(500).send('Error fetching gift');
    }
});



// Add a new gift
/*jshint esversion: 8 */
router.post('/', async (req, res, next) => {
    try {
        /*jshint esversion: 8 */
        const db = await connectToDatabase();
        /*jshint esversion: 8 */
        const collection = db.collection("gifts");
        /*jshint esversion: 8 */
        const gift = await collection.insertOne(req.body);

        res.status(201).json(gift.ops[0]);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
