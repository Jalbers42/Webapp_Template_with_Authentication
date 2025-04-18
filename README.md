# Web Template

### This project contains a basic web app structure, including a react.ts client, nestjs server and firebase for authentication and database.

The webapp has login functionality using firebase, users are stored to a firestore db. Also there is a basic websocket connection set up using the client, if user presses the button after loggin in. This is not using socket.io, but basic websocket.

### Run cmds

npm run dev - client
npm run start:dev - server

# SETUP

1. Create firebase project
2. Enable login via email and google
3. Create firestore db and create user collection
    - This template create user entries in db, which allows for saving custom profiles. *password is saved by fb separately*
4. Create the following .env files in server and client folder

    #### Server *Project Settings -> Service Accounts -> Generate New Private Key*
    FIREBASE_TYPE=
    FIREBASE_PROJECT_ID=
    FIREBASE_PRIVATE_KEY_ID=
    FIREBASE_PRIVATE_KEY=""
    FIREBASE_CLIENT_EMAIL=
    FIREBASE_CLIENT_ID=
    FIREBASE_AUTH_URI=
    FIREBASE_TOKEN_URI=
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL=
    FIREBASE_CLIENT_X509_CERT_URL=

    #### Client *Project Settings -> Apps -> const firebaseConfig = ...*
    VITE_FIREBASE_API_KEY=
    VITE_FIREBASE_AUTH_DOMAIN=
    VITE_FIREBASE_PROJECT_ID=
    VITE_FIREBASE_STORAGE_BUCKET=
    VITE_FIREBASE_MESSAGING_SENDER_ID=
    VITE_FIREBASE_APP_ID=
    VITE_FIREBASE_MEASUREMENT_ID=

5. If required, you need to enable firebase api for project. See error msg.