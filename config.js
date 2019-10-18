exports.PORT = process.env.PORT || 8000;
exports.DATABASE_URL = process.env.DATABASE_URL ||"mongodb://localhost/local-gdc2api";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || "mongodb://localhost/test-gdc2api";
exports.PETFINDER_TOKEN = process.env.PETFINDER_TOKEN || '';
exports.PETFINDER_CLIENT_SECRET = process.env.PETFINDER_CLIENT_SECRET || '';
exports.PETFINDER_CLIENT_ID = process.env.PETFINDER_CLIENT_ID || '';
exports.PETFINDER_API_URL = process.env.PETFINDER_API_URL || "https://api.petfinder.com/v2";
exports.JWT_SECRET = process.env.JWT_SECRET || "FELIBO";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "1d";

