import admin from "firebase-admin";

const FIREBASE_TYPE = process.env.TYPE;
const FIREBASE_PROJECT_ID = process.env.PROJECT_ID;
const FIREBASE_PRIVATE_KEY_ID = process.env.PRIVATE_KEY_ID;
const FIREBASE_PRIVATE_KEY = process.env.PRIVATE_KEY;
const FIREBASE_CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const FIREBASE_CLIENT_ID = process.env.CLIENT_ID;
const FIREBASE_AUTH_URI = process.env.AUTH_URI;
const FIREBASE_TOKEN_URI = process.env.TOKEN_URI;
const FIREBASE_AUTH_PROVIDER_X509_CERT_URL =
  process.env.AUTH_PROVIDER_X509_CERT_URL;
const FIREBASE_CLIENT_X509_CERT_URL = process.env.CLIENT_X509_CERT_URL;
const FIREBASE_UNIVERSE_DOMAIN = process.env.UNIVERSE_DOMAIN;

const serviceAccount = {
  type: FIREBASE_TYPE,
  project_id: FIREBASE_PROJECT_ID,
  private_key_id: FIREBASE_PRIVATE_KEY_ID,
  private_key: FIREBASE_PRIVATE_KEY,
  client_email: FIREBASE_CLIENT_EMAIL,
  client_id: FIREBASE_CLIENT_ID,
  auth_uri: FIREBASE_AUTH_URI,
  token_uri: FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: FIREBASE_UNIVERSE_DOMAIN,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
