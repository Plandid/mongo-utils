#! /usr/bin/env node

const { MongoClient } = require('mongodb');
const fs = require('fs');
const process = require('process');
const { getdbName } = require('./index');

require('dotenv').config();

const url = process.argv[2] ? process.argv[2] : process.env.DB_URL;
if (!url) {
    console.log('no DB_URL in .env or no url passed');
}

async function main() {
    const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

    await client.connect();
    const db = client.db(getdbName(url));

    for (const collection of await db.getCollectionNames()) {
        await db.collection(collection).deleteMany({});
        console.log(`collection: ${collection} has been cleared`);
    }

    await client.close();

    console.log(`database: ${getdbName(url)} has been cleared of all documents`)
    process.exit(0);
}

main();