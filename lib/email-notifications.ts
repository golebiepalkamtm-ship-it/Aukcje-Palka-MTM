import nodemailer from 'nodemailer';

/**
 * Email Service - Wysyłanie notyfikacji o licytacjach
 * 
 * UWAGA: Dla produkcji, należy konfigurować zmienne środowiskowe:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - SMTP_FROM
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export interface BidNotificationData {
  auctionId: string;
  newBidderEmail: string;
  newBidderName: string;
  newBidAmount: number;
  auctionTitle: string;
  previousBidderEmail?: string;
  previousBidAmount?: number;
}

/**
 * Wyślij notyfikację email gdy złożona została nowa licytacja
 */
export async function sendBidNotification(data: BidNotificationData) {
  try {
    const from = process.env.SMTP_FROM || 'aukcje@palkamtm.pl';

    // Email dla nowego licytującego (potwierdzenie)
    await transporter.sendMail({
      from,
      to: data.newBidderEmail,
      subject: `✅ Licytacja potwierdzona - ${data.auctionTitle}`,
      html: generateBidConfirmationEmail({
        bidderName: data.newBidderName,
        auctionTitle: data.auctionTitle,
        bidAmount: data.newBidAmount,
        auctionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auctions/${data.auctionId}`,
      }),
    });

    // Email dla poprzedniego licytującego (został prześcignięty)
    if (data.previousBidderEmail) {
      await transporter.sendMail({
        from,
        to: data.previousBidderEmail,
        subject: `⚠️ Została złożona wyższa licytacja - ${data.auctionTitle}`,
        html: generateOutbidEmail({
          auctionTitle: data.auctionTitle,
          yourBid: data.previousBidAmount || 0,
          newBid: data.newBidAmount,
          auctionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auctions/${data.auctionId}`,
        }),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending bid notification:', error);
    return { success: false, error };
  }
}

/**
 * Wyślij notyfikację email gdy aukcja się zakończyła
 */
export async function sendAuctionEndedNotification(
  auctionId: string,
  auctionTitle: string,
  winnerEmail: string,
  winnerName: string,
  finalPrice: number,
  sellerEmail: string
) {
  try {
    const from = process.env.SMTP_FROM || 'aukcje@palkamtm.pl';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Email dla zwycięzcy
    await transporter.sendMail({
      from,
      to: winnerEmail,
      subject: `🎉 Wygrałeś aukcję! - ${auctionTitle}`,
      html: generateAuctionWonEmail({
        winnerName,
        auctionTitle,
        finalPrice,
        auctionUrl: `${appUrl}/auctions/${auctionId}/success`,
      }),
    });

    // Email dla sprzedawcy
    await transporter.sendMail({
      from,
      to: sellerEmail,
      subject: `✅ Aukcja zakończona - ${auctionTitle}`,
      html: generateSellerNotificationEmail({
        auctionTitle,
        winnerName,
        finalPrice,
        auctionUrl: `${appUrl}/auctions/${auctionId}`,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending auction ended notification:', error);
    return { success: false, error };
  }
}

// ============ EMAIL TEMPLATES ============

function generateBidConfirmationEmail(data: {
  bidderName: string;
  auctionTitle: string;
  bidAmount: number;
  auctionUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Licytacja potwierdzona!</h2>
          </div>
          <div class="content">
            <p>Cześć ${data.bidderName},</p>
            <p>Twoja licytacja została pomyślnie złożona!</p>
            <ul>
              <li><strong>Aukcja:</strong> ${data.auctionTitle}</li>
              <li><strong>Twoja oferta:</strong> ${data.bidAmount.toLocaleString('pl-PL')} zł</li>
            </ul>
            <p>Będziemy Cię informować o każdej wyższej ofercie. Jeśli zostaniesz prześcignięty, wyślemy Ci powiadomienie email.</p>
            <a href="${data.auctionUrl}" class="button">Przejdź do aukcji</a>
          </div>
          <div class="footer">
            <p>© 2025 Aukcje Palka MTM. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateOutbidEmail(data: {
  auctionTitle: string;
  yourBid: number;
  newBid: number;
  auctionUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background: #ff9a56; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Została złożona wyższa licytacja!</h2>
          </div>
          <div class="content">
            <p>Niestety, ktoś przebił Twoją ofertę w aukcji <strong>${data.auctionTitle}</strong></p>
            <ul>
              <li><strong>Twoja oferta:</strong> ${data.yourBid.toLocaleString('pl-PL')} zł</li>
              <li><strong>Aktualna oferta:</strong> ${data.newBid.toLocaleString('pl-PL')} zł</li>
            </ul>
            <p>Możesz złożyć wyższą licytację, aby wrócić do gry!</p>
            <a href="${data.auctionUrl}" class="button">Złóż wyższą licytację</a>
          </div>
          <div class="footer">
            <p>© 2025 Aukcje Palka MTM. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateAuctionWonEmail(data: {
  winnerName: string;
  auctionTitle: string;
  finalPrice: number;
  auctionUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background: #11998e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Gratulacje! Wygrałeś aukcję!</h2>
          </div>
          <div class="content">
            <p>Cześć ${data.winnerName},</p>
            <p>Jesteśmy szczęśliwi, aby poinformować Cię, że wygrałeś aukcję!</p>
            <ul>
              <li><strong>Aukcja:</strong> ${data.auctionTitle}</li>
              <li><strong>Cena wygrywająca:</strong> ${data.finalPrice.toLocaleString('pl-PL')} zł</li>
            </ul>
            <p>Przejdź do strony aukcji, aby sfinalizować transakcję i skontaktować się ze sprzedawcą.</p>
            <a href="${data.auctionUrl}" class="button">Finalizuj zakup</a>
          </div>
          <div class="footer">
            <p>© 2025 Aukcje Palka MTM. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateSellerNotificationEmail(data: {
  auctionTitle: string;
  winnerName: string;
  finalPrice: number;
  auctionUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .button { display: inline-block; background: #f093fb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Aukcja zakończona!</h2>
          </div>
          <div class="content">
            <p>Twoja aukcja <strong>${data.auctionTitle}</strong> się zakończyła!</p>
            <ul>
              <li><strong>Zwycięzca:</strong> ${data.winnerName}</li>
              <li><strong>Ostateczna cena:</strong> ${data.finalPrice.toLocaleString('pl-PL')} zł</li>
            </ul>
            <p>Przejdź do panelu sprzedawcy, aby skontaktować się ze zwycięzcą i sfinalizować transakcję.</p>
            <a href="${data.auctionUrl}" class="button">Zarządzaj aukcją</a>
          </div>
          <div class="footer">
            <p>© 2025 Aukcje Palka MTM. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
