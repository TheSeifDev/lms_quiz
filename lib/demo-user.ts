/**
 * DEV MODE CONFIGURATION
 * =====================
 * This file provides hardcoded user data for testing without authentication.
 * Switch between student and doctor roles by changing CURRENT_ROLE below.
 */

export type DemoRole = 'student' | 'doctor';

// 🔄 CHANGE THIS TO SWITCH BETWEEN STUDENT AND DOCTOR VIEWS
export const CURRENT_ROLE: DemoRole = 'student'; // Change to 'doctor' to test doctor features

// Demo user IDs (matching the SQL script - using specific UUIDs for easy reference)
export const DEMO_USERS = {
    student: {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Seif Ayman',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seif',
        role: 'student' as const,
        academic_id: '2521233',
    },
    doctor: {
        id: '22222222-2222-2222-2222-222222222222',
        full_name: 'Dr. Ahmed',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
        role: 'doctor' as const,
        academic_id: 'DR-001',
    },
} as const;

// Demo quiz IDs (from SQL script)
export const DEMO_QUIZ_IDS = {
    computerSecurity: '33333333-3333-3333-3333-333333333333', // Code: TEST
    database: '44444444-4444-4444-4444-444444444444',         // Code: DB01
    webDev: '55555555-5555-5555-5555-555555555555',           // Code: WEB1
} as const;

// Get current demo user based on CURRENT_ROLE
export function getCurrentDemoUser() {
    return DEMO_USERS[CURRENT_ROLE];
}

// Get current user ID
export function getCurrentUserId() {
    return getCurrentDemoUser().id;
}

// Check if current user is student
export function isStudent() {
    return CURRENT_ROLE === 'student';
}

// Check if current user is doctor
export function isDoctor() {
    return CURRENT_ROLE === 'doctor';
}

// Dev mode flag - set to false to enable real authentication
export const DEV_MODE = true;
