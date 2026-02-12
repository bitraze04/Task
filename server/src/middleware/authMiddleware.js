/**
 * Authentication Middleware
 * 
 * Verifies Firebase ID token from Authorization header.
 * Attaches decoded user info to request object.
 */

import { auth, db } from '../config/firebase.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);

        // Fetch user data from Firestore to get role
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return res.status(401).json({
                success: false,
                message: 'User not found in database'
            });
        }

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            ...userDoc.data()
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
};
