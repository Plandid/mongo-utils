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
    
    if (fs.existsSync('./schemas.json')) {
        const schemas = JSON.parse(fs.readFileSync('./schemas.json'));
        for (let schemaName in schemas) {
            await db.createCollection(schemaName, {
                validator: {
                    $jsonSchema: schemas[schemaName]
                }
            });
            console.log(`created collection: ${schemaName}`);
        }
    } else {
        console.error('error: no schemas.json');
        process.exit(1);
    }

    if (fs.existsSync('./indexes.json')) {
        const indexes = JSON.parse(fs.readFileSync('./indexes.json'));
        for (const collection in indexes) {
            for (const kvp of indexes[collection]) {
                await db.collection(collection).createIndex(kvp.index, kvp.options);
            }
            console.log(`created indexes for collection: ${collection}`);
        }
    } else {
        console.log('no indexes.json');
    }

    if (fs.existsSync('./exampleData.js')) {
        const examples = require(process.cwd() + '/exampleData');
        for (const collection in examples) {
            await db.collection(collection).insertOne(examples[collection]);
            console.log(`inserted example for collection: ${collection}`);
        }
    } else {
        console.log('no exampleData.js');
    }

    await client.close();

    console.log(`database: ${getdbName(url)} has been created`);
    process.exit(0);
}

main();