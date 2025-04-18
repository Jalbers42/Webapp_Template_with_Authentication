// firebase.service.ts
import { Injectable } from '@nestjs/common';
import { initializeApp, cert } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { auth } from 'firebase-admin';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { DecodedJwtToken } from 'src/shared/types';

dotenv.config();

@Injectable()
export class FirebaseService {
    private db: FirebaseFirestore.Firestore;

    constructor() {

        const serviceAccount = {
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        } as admin.ServiceAccount;

        initializeApp({ credential: cert(serviceAccount) });

        this.db = getFirestore();
    }

    async generate_jwt_token(user_uid: string) {
        return await admin.auth().createCustomToken(user_uid);
    }

    // Firebase Authentication: Verify ID Token
    async verify_firebase_jwt_token(token: string): Promise<auth.DecodedIdToken> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken;
        } catch (error) {
            throw new Error('Invalid Firebase token');
        }
    }

    getDb() {
        return this.db;
    }

    get_firebase_server_timestamp_field() {
        return (FieldValue.serverTimestamp());
    }

    async is_username_available(username: string) {
        const usersCollection = this.db.collection('users');
        const querySnapshot = await usersCollection.where('username', '==', username).get();
        return querySnapshot.empty;
    }

    async create_user(email: string, password: string, username: string) {
        const userCredential = await admin.auth().createUser({
            email,
            password,
            displayName: username,
        });

        await this.db.collection('users').doc(userCredential.uid).set({
            username,
            email,
            // createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return userCredential;
    }

    async is_user_stored_in_db(user_uid: string) {
        const userRef = this.db.collection('users').doc(user_uid);
        const userSnapshot = await userRef.get();
        return (userSnapshot.exists)
    }

    async store_user_in_db(decoded_jwt_token: DecodedJwtToken) {
        const userRef = this.db.collection('users').doc(decoded_jwt_token.uid);
        await userRef.set({
            username: decoded_jwt_token.name,
            email: decoded_jwt_token.email,
            uid: decoded_jwt_token.uid,
            createdAt: this.get_firebase_server_timestamp_field(),
        });
    }

    async delete_user_from_firebase_auth(user_uid: string): Promise<void> {
        await admin.auth().deleteUser(user_uid);
    }

    async delete_user_from_db(user_uid: string): Promise<void> {
        const userRef = this.db.collection('users').doc(user_uid);
        await userRef.delete();
    }

    async update_username_in_auth(user_uid: string, new_username: string) {
        await admin.auth().updateUser(user_uid, {
            displayName: new_username,
        });
    }

    async update_username_in_db(user_uid: string, new_username: string) {
        const userRef = this.db.collection('users').doc(user_uid);
        await userRef.update({
            username: new_username
        });
    }

}