// firebase.service.ts
import { Injectable } from '@nestjs/common';
import { initializeApp, cert } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { FirebaseGameSession, GameSession } from 'src/app.types';
import { auth } from 'firebase-admin';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

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

    async register_user(email: string, password: string, username: string) {
        try {
            const q = this.db.collection('users').where('username', '==', username);
            const querySnapshot = await q.get();
            if (!querySnapshot.empty) {
                throw new Error("Username is unavailable.");
            }

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
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async reset_password_with_username_or_email(email_or_username: string) {
        try {
            let userEmail: string | null = null

            if (email_or_username.includes('@'))
                userEmail = email_or_username
            else {
                const username = email_or_username
                const usersCollection = admin.firestore().collection('users');
                const querySnapshot = await usersCollection.where('username', '==', username).get();

                if (querySnapshot.empty)
                    throw new Error('Username not found');

                const userDoc = querySnapshot.docs[0];
                userEmail = userDoc.data().email;

                if (!userEmail)
                    throw new Error('Email not found for the given username');
            }

            await admin.auth().generatePasswordResetLink(userEmail);
            return `Password reset email sent to: ${userEmail}`;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async sync_user_with_database() {

    }
}