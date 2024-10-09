// firebase.service.ts
import { Injectable } from '@nestjs/common';
import { initializeApp, cert } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { FirebaseGameSession, GameSession } from 'src/app.types';
import { auth } from 'firebase-admin';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { DatabaseUser, DecodedJwtToken } from 'src/shared/types';
import * as nodemailer from 'nodemailer';

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

    async get_game_session_from_db(id : string) {
        const documentSnapshot = await this.db.collection('game-sessions').doc(id).get();
        const firebaseGameSession = documentSnapshot.data();
        if (firebaseGameSession !== undefined) {
            const gameSession : GameSession = {
                player_white: firebaseGameSession.player_white,
                player_black: firebaseGameSession.player_black,
                turn: firebaseGameSession.turn,
                start_time: firebaseGameSession.start_time,
                board: [
                    firebaseGameSession.row_0,
                    firebaseGameSession.row_1,
                    firebaseGameSession.row_2,
                    firebaseGameSession.row_3,
                    firebaseGameSession.row_4,
                    firebaseGameSession.row_5,
                    firebaseGameSession.row_6,
                    firebaseGameSession.row_7
                ]
            };
            return (gameSession);
        }
    }

    async add_game_session_to_db(gameSession : FirebaseGameSession) {
        const gameSessionRef = this.db.collection('game-sessions').doc();
        const response = await gameSessionRef.set(gameSession);
        return (gameSessionRef.id);
    }

    get_firebase_server_timestamp_field() {
        return (FieldValue.serverTimestamp());
    }

    async update_game_session_in_db(id: string, gameSession: GameSession) {
        const firebaseGameSession : FirebaseGameSession = {
            player_white: gameSession.player_white,
            player_black: gameSession.player_black,
            turn: gameSession.turn,
            start_time: gameSession.start_time,
            row_0: gameSession.board[0],
            row_1: gameSession.board[1],
            row_2: gameSession.board[2],
            row_3: gameSession.board[3],
            row_4: gameSession.board[4],
            row_5: gameSession.board[5],
            row_6: gameSession.board[6],
            row_7: gameSession.board[7]
        };
        const gameSessionRef = this.db.collection('game-sessions').doc(id);
        const response = await gameSessionRef.update(firebaseGameSession);
        return response;
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
            eloRating: 1200,
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

    async generate_jwt_token(user_uid: string) {
        return await admin.auth().createCustomToken(user_uid);
    }

}