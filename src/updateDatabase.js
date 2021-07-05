const { MongoClient } = require("mongodb");
const fs = require("fs");
const process = require('process');

require('dotenv').config();

const url = process.argv[2] ? process.argv[2] : process.env.DB_URL;
if (!url) {
    console.log('no DB_URL in .env or no url passed');
}

(async function() {
    const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

    await client.connect();
    const db = client.db(getdbName(url));

    if (fs.existsSync('./schemas.json')) {
        const schemas = JSON.parse(fs.readFileSync('./schemas.json'));
        for (let schemaName in schemas) {
            await db.command({
                collMod: schemaName,
                validator: {
                    $jsonSchema: schemas[schemaName]
                }
            });
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
        }
    } else {
        console.log('no indexes.json');
    }

    await client.close();

    console.log(`database ${databaseName} has been updated`);
    process.exit(0);
})();