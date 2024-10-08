import * as admin from 'firebase-admin';

export interface DatabaseUser {
    uid: string;
    email: string;
    displayName: string;
    createdAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

export interface DecodedJwtToken {
    uid: string,
    name: string,
    email: string,
    auth_time: number,
    email_verified: boolean,
}
