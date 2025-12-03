/**
 * Centralne typy autoryzacji dla systemu 3-poziomowej weryfikacji
 * Single Source of Truth dla typów auth
 */

import { Role } from '@prisma/client'

// ============================================
// STAŁE HIERARCHII RÓL
// ============================================

export const ROLE_HIERARCHY: Record<Role, number> = {
  USER_REGISTERED: 1,
  USER_EMAIL_VERIFIED: 2,
  USER_FULL_VERIFIED: 3,
  ADMIN: 4,
} as const

// ============================================
// TYPY UŻYTKOWNIKA AUTH
// ============================================

export interface AuthUserBase {
  id: string
  firebaseUid: string
  email: string
  role: Role
}

export interface AuthUserProfile extends AuthUserBase {
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  image: string | null
}

export interface AuthUserVerification {
  isActive: boolean
  emailVerified: Date | null
  isPhoneVerified: boolean
  isProfileVerified: boolean
}

export type AuthUserFull = AuthUserProfile & AuthUserVerification & {
  createdAt: Date
  updatedAt: Date
  lastLogin: Date | null
}

// ============================================
// TYPY ODPOWIEDZI MIDDLEWARE
// ============================================

export interface AuthMiddlewareSuccess {
  decodedToken: {
    uid: string
    email?: string
    email_verified?: boolean
    name?: string
    [key: string]: unknown
  }
}

export interface AuthErrorResponse {
  error: string
  requiresEmailVerification?: boolean
  requiresFullVerification?: boolean
  requiresPhoneVerification?: boolean
  requiresProfileCompletion?: boolean
  currentRole?: Role
  requiredRole?: Role
  isPhoneVerified?: boolean
  isProfileVerified?: boolean
}

// ============================================
// TYPY STATUSU WERYFIKACJI
// ============================================

export interface VerificationStatus {
  level: 1 | 2 | 3
  role: Role
  emailVerified: boolean
  phoneVerified: boolean
  profileVerified: boolean
  canAccessDashboard: boolean
  canCreateAuctions: boolean
  canBid: boolean
}

export function getVerificationStatus(user: {
  role: Role
  emailVerified: Date | null
  isPhoneVerified: boolean
  isProfileVerified: boolean
  isActive: boolean
}): VerificationStatus {
  const level = user.role === 'USER_FULL_VERIFIED' || user.role === 'ADMIN' 
    ? 3 
    : user.role === 'USER_EMAIL_VERIFIED' 
      ? 2 
      : 1

  return {
    level,
    role: user.role,
    emailVerified: !!user.emailVerified && user.isActive,
    phoneVerified: user.isPhoneVerified,
    profileVerified: user.isProfileVerified,
    canAccessDashboard: level >= 2,
    canCreateAuctions: level >= 3,
    canBid: level >= 3,
  }
}

// ============================================
// TYPY SYNC
// ============================================

export interface SyncUserInput {
  firstName?: string
  lastName?: string
}

export interface SyncUserResult {
  success: boolean
  user: AuthUserFull
  roleUpgraded?: boolean
}

// ============================================
// TYPY WERYFIKACJI SMS
// ============================================

export interface VerifySmsCodeInput {
  code: string
}

export interface SendVerificationCodeInput {
  phoneNumber: string
}

// ============================================
// TYPY COMPLETE PROFILE
// ============================================

export interface CompleteProfileInput {
  firstName: string
  lastName: string
  address: string
  city?: string
  postalCode?: string
  phoneNumber?: string
}

// ============================================
// RE-EXPORT
// ============================================

export { Role } from '@prisma/client'