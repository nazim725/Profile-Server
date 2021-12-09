const express = require('express')
const app = express();
const port = process.env.PORT || 5000
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

const cors = require('cors')
require('dotenv').config();

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9s2cu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();

        const database = client.db("Profile");
        const profileCollection = database.collection("profiles");

        // save profile to database
        app.post('/profiles', async (req, res) => {
            const profile = req.body;
            if (!profile.status) {
                profile.status = "ACTIVE";
            }
            const result = await profileCollection.insertOne(profile)
            res.json(result)

        });



        // update status into profile collection
        app.put('/profiles/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = { $set: { status: updatedStatus.status } };
            const result = await profileCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        });

        // delete a data from profile collection
        app.delete('/profiles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await profileCollection.deleteOne(query);
            res.json(result);
        })

        // get all profiles according to status Paused
        app.get('/profiles', async (req, res) => {
            const status = req.query.status;
            const query = { status: status }
            if (status) {
                const cursor = profileCollection.find(query);
                const profile = await cursor.toArray();
                res.send(profile);
            }
            else {
                const cursor = profileCollection.find();
                const profile = await cursor.toArray();
                res.send(profile);
            }

        });



    }
    finally {
        // await client.close(()
    }

}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.json('Profile server')
})

app.listen(port, () => {
    console.log(`Profile server  at :${port}`)
})

