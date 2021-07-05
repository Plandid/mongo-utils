const { MongoClient } = require("mongodb");
const fs = require("fs");
const process = require('process');
const { getdbName } = require('./index');

require('dotenv').config();

const url = process.argv[2] ? process.argv[2] : process.env.DB_URL;
if (!url) {
    console.log('no DB_URL in .env or no url passed');
}

(async function() {
    const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

    await client.connect();
    const db = client.db(getdbName(url));

    await db.dropDatabase();

    await client.close();

    console.log(`database: ${databaseName} has been deleted`)
    process.exit(0);
})()