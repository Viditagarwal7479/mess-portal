const mongodbStore = require("connect-mongodb-session");

const session = require("express-session");

function createSessionStore() {
    const MongoDBStore = mongodbStore(session);

    const store = new MongoDBStore({
        uri: "mongodb://127.0.0.1:27017",
        databaseName: "messPortal",
        collection: "sessions",
    });

    return store;
}

function createSessionConfig() {
    return {
        secret: "secret key",
        resave: true,
        saveUninitialized: true,
        store: createSessionStore(),
        cookie: {
            maxAge: 2 * 24 * 60 * 600,
        },
    };
}

module.exports = createSessionConfig;
