const { MongoClient, ObjectID } = require('mongodb');

let client;
let dbName;

function getClient() {
    return client;
}

function getDatabaseName() {
    return dbName;
}

async function getDatabase() {
    return await client.db(dbName);
}

async function connect(url) {
    if (url.indexOf('/') !== -1) {
        dbName = url.substring(url.indexOf('mongodb.net/') + 12, url.lastIndexOf('?'));
    } else {
        dbName = url.substring(url.indexOf('mongodb.net/') + 12);
    }
    
    try {
        client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
        await client.connect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

async function disconnect() {
    try {
        await client.close();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function mongoCollectionApiMethods(router, collection, pathFilter={}, recordFilter={}) {
    router.get("/:_id", async function(req, res, next) {
        try {
            const { filter } = useFilter(req, pathFilter, {});
            let data = await collection.find(filter);
            data = await data.count() > 1 ? await data.toArray() : await data.next();
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    router.post("/", async function(req, res, next) {
        try {
            const { record } = useFilter(req, {}, recordFilter);
            await collection.insertOne(record);
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.post("/:_id", async function(req, res, next) {
        try {
            const { filter, record } = useFilter(req, pathFilter, recordFilter);
            await collection.insertOne({ ...filter, ...record });
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.put("/:_id", async function(req, res, next) {
        try {
            const { filter, record } = useFilter(req, pathFilter, recordFilter);
            await collection.replaceOne(filter, { ...filter, ...record }, { upsert: true });
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.patch("/:_id", async function(req, res, next) {
        try {
            const { filter, record } = useFilter(req, pathFilter, recordFilter);
            await collection.updateOne(filter, {$set: record});
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/:_id", async function(req, res, next) {
        try {
            const { filter } = useFilter(req, pathFilter, {});
            await collection.deleteOne(filter);
        
            res.sendStatus(200);
        } catch (error) {
            next(error);
        }
    });
}

module.exports = {
    ObjectID: ObjectID,
    getClient: getClient,
    getUrl: getUrl,
    getDatabaseName: getDatabaseName,
    getDatabase: getDatabase,
    connect: connect,
    disconnect: disconnect,
    mongoCollectionApiMethods: mongoCollectionApiMethods 
}