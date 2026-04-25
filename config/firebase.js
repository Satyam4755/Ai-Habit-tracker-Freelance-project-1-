const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db;
let auth;
let isMock = false;

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        auth = admin.auth();
        console.log("🔥 Firebase connected successfully.");
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        auth = admin.auth();
        console.log("🔥 Firebase connected successfully via Base64.");
    } else {
        // Fall back to throw if no JSON or Base64 is provided, because connecting
        // with just Project ID will crash on actual DB reads due to lack of auth.
        throw new Error("No service account credentials found.");
    }
} catch (error) {
    console.log("ℹ️  Running in Local Database Mode (No Service Account credentials detected).");
    isMock = true;
    
    // Tiny In-Memory Mock representing Firestore for demo purposes
    const mockStorage = {
        users: {},
        habits: {},
        habitLogs: {}
    };

    const mockDoc = (collection, id) => {
        return {
            get: async () => ({
                exists: !!mockStorage[collection][id],
                id,
                data: () => mockStorage[collection][id],
            }),
            set: async (data, opts = {}) => {
                if (opts.merge && mockStorage[collection][id]) {
                    mockStorage[collection][id] = { ...mockStorage[collection][id], ...data };
                } else {
                    mockStorage[collection][id] = { ...data, id }; // Inject id for easier retrieval in mock
                }
            },
            update: async (data) => {
                if (!mockStorage[collection][id]) throw new Error("Document not found");
                mockStorage[collection][id] = { ...mockStorage[collection][id], ...data };
            },
            delete: async () => {
                delete mockStorage[collection][id];
            }
        };
    };

    const mockCollection = (collection) => {
        return {
            doc: (id) => mockDoc(collection, id || Date.now().toString()),
            add: async (data) => {
                const id = Date.now().toString();
                mockStorage[collection][id] = { ...data, id }; // Store id inside for easy mock querying
                return mockDoc(collection, id);
            },
            where: (field, op, value) => {
                // Return a mock querier
                return {
                    get: async () => {
                        const docs = Object.entries(mockStorage[collection])
                            .filter(([id, data]) => data[field] === value)
                            .map(([id, data]) => ({
                                id,
                                data: () => data
                            }));
                        return { empty: docs.length === 0, docs, forEach: (cb) => docs.forEach(cb) };
                    }
                }
            },
            get: async () => {
                const docs = Object.keys(mockStorage[collection]).map(id => ({
                    id, 
                    data: () => mockStorage[collection][id]
                }));
                return { empty: docs.length === 0, docs, forEach: (cb) => docs.forEach(cb) };
            }
        };
    };

    db = {
        collection: mockCollection
    };
}

module.exports = { db, admin, isMock };
