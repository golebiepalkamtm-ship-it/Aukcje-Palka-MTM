// Client-only Firebase error handler
import { FirebaseError } from 'firebase/app';
import { AppErrors, AppError } from './error-handling';

export function handleFirebaseError(error: FirebaseError): AppError {
  switch (error.code) {
    case 'auth/invalid-email':
      return AppErrors.validation('Nieprawidłowy adres email');
    case 'auth/user-not-found':
      return AppErrors.notFound('Użytkownik');
    case 'auth/wrong-password':
      return AppErrors.unauthorized('Nieprawidłowe hasło');
    case 'auth/email-already-in-use':
      return AppErrors.conflict('Email już jest w użyciu');
    case 'auth/weak-password':
      return AppErrors.validation('Hasło jest za słabe');
    case 'auth/too-many-requests':
      return AppErrors.rateLimit('Zbyt wiele prób logowania');
    default:
      return AppErrors.externalService('Firebase', error.message);
  }
}
