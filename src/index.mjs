import { MongoClient } from 'mongodb';

let client;
let url;
let dbName;

export function getClient() {
    return client;
}

export function getUrl() {
    return url;
}

export function getdatabaseName() {
    return dbName;
}

export async function connect(urlString) {
    url = new URL(urlString);
    dbName = url.pathname;
    try {
        client = new MongoClient(urlString, {useNewUrlParser: true, useUnifiedTopology: true});
        await client.connect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export async function disconnect() {
    try {
        await client.close();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function getdb(databaseName) {
    return client.db(databaseName);
}

export async function mongoCollectionMethods(router, collection, pathFilter={}, recordFilter={}) {
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