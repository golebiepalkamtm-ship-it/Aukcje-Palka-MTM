@echo off
set POSTGRES_USER=MTM
set POSTGRES_PASSWORD=Milosz1205
set POSTGRES_DB=palka_core_prod
set REDIS_PASSWORD=A1gaqudmb9paf33kqfz9loe6xujl80oaq4u9to7e4e6tqy6zkgv
set NEXTAUTH_URL=https://palkamtm.pl
set NEXTAUTH_SECRET=VhtNSG4Hac/o7l9ehQMMLr/NE3t/DkXOA1MGgwzhfdo=
set NEXT_PUBLIC_APP_URL=https://palkamtm.pl
set NEXT_PUBLIC_BASE_URL=https://palkamtm.pl
set NEXT_TELEMETRY_DISABLED=1
set NODE_ENV=production
set NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCrGcWptUnRgcNnAQl01g5RjPdMfZ2tJCA
set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=m-t-m-62972.firebaseapp.com
set NEXT_PUBLIC_FIREBASE_PROJECT_ID=m-t-m-62972
set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=m-t-m-62972.appspot.com
set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=714609522899
set NEXT_PUBLIC_FIREBASE_APP_ID=1:714609522899:web:462e995a1f358b1b0c3c26
set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-T645E1YQHW
set NEXT_PUBLIC_ASSET_BASE_URL=https://storage.googleapis.com/m-t-m-62972.firebasestorage.app
set FIREBASE_PROJECT_ID=m-t-m-62972
set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@m-t-m-62972.iam.gserviceaccount.com
set GRAFANA_ADMIN_USER=admin
set GRAFANA_ADMIN_PASSWORD=admin123
set CONTACT_EMAIL=contact@palkamtm.pl
set EMAIL_SERVER_HOST=smtp.gmail.com
set EMAIL_SERVER_PORT=587
set EMAIL_SERVER_USER=contact@palkamtm.pl
set EMAIL_SERVER_PASSWORD=your_app_password_here
set SMS_PROVIDER=firebase

echo Starting production Docker containers...
docker-compose -f docker-compose.prod.yml up --build -d