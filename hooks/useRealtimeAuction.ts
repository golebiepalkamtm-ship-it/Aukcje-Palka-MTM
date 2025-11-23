import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  Unsubscribe,
} from 'firebase/firestore';

export interface RealtimeAuction {
  id: string;
  title: string;
  currentPrice: number;
  endTime: Date;
  status: string;
  bidsCount: number;
}

export interface RealtimeBid {
  id: string;
  amount: number;
  bidderName: string;
  createdAt: Date;
  isWinning: boolean;
}

interface UseRealtimeAuctionOptions {
  enabled?: boolean;
  watchBids?: boolean;
  bidsLimit?: number;
}

/**
 * Hook do realtime updates aukcji z Firebase Firestore
 * 
 * Zastępuje polling co 5s na rzecz efektywnych Firebase Listeners
 * 
 * @param auctionId - ID aukcji
 * @param options - Opcje (enabled, watchBids, bidsLimit)
 * @returns { auction, bids, loading, error, unsubscribe }
 */
export function useRealtimeAuction(
  auctionId: string | null,
  options: UseRealtimeAuctionOptions = {}
) {
  const { enabled = true, watchBids = true, bidsLimit = 10 } = options;

  const [auction, setAuction] = useState<RealtimeAuction | null>(null);
  const [bids, setBids] = useState<RealtimeBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribers, setUnsubscribers] = useState<Unsubscribe[]>([]);

  // Subskrybuj zmiany aukcji
  useEffect(() => {
    if (!enabled || !auctionId || !db) {
      setLoading(false);
      return;
    }

    const newUnsubscribers: Unsubscribe[] = [];

    try {
      // Nasłuchuj zmiany aukcji w realtime
      const auctionDoc = doc(db, 'auctions', auctionId);
      const unsubscribeAuction = onSnapshot(
        auctionDoc,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setAuction({
              id: snapshot.id,
              title: data.title || '',
              currentPrice: data.currentPrice || 0,
              endTime: data.endTime ? new Date(data.endTime) : new Date(),
              status: data.status || 'ACTIVE',
              bidsCount: data.bidsCount || 0,
            });
            setError(null);
          } else {
            setError('Aukcja nie została znaleziona');
            setAuction(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('Realtime auction error:', err);
          setError(err.message);
          setLoading(false);
        }
      );
      newUnsubscribers.push(unsubscribeAuction);

      // Nasłuchuj zmiany licytacji w realtime (jeśli enabled)
      if (watchBids) {
        const bidsQuery = query(
          collection(db, 'auctions', auctionId, 'bids'),
          orderBy('amount', 'desc'),
          limit(bidsLimit)
        );

        const unsubscribeBids = onSnapshot(
          bidsQuery,
          (snapshot) => {
            const newBids: RealtimeBid[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              newBids.push({
                id: doc.id,
                amount: data.amount || 0,
                bidderName: data.bidderName || 'Anonimowy',
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
                isWinning: data.isWinning || false,
              });
            });
            setBids(newBids);
          },
          (err) => {
            console.error('Realtime bids error:', err);
            // Nie przerywaj jeśli bids się nie załadują
          }
        );
        newUnsubscribers.push(unsubscribeBids);
      }

      setUnsubscribers(newUnsubscribers);

      // Cleanup
      return () => {
        newUnsubscribers.forEach((unsubscribe) => unsubscribe());
      };
    } catch (err) {
      console.error('Setup realtime listeners error:', err);
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      setLoading(false);
    }
  }, [enabled, auctionId, watchBids, bidsLimit]);

  // Funkcja do manualnego odłączenia
  const unsubscribe = useCallback(() => {
    unsubscribers.forEach((unsub) => unsub());
    setUnsubscribers([]);
  }, [unsubscribers]);

  return {
    auction,
    bids,
    loading,
    error,
    unsubscribe,
  };
}

/**
 * Hook do nasłuchiwania tylko licytacji (bez aukcji)
 */
export function useRealtimeBids(
  auctionId: string | null,
  options: { enabled?: boolean; limit?: number } = {}
) {
  const { enabled = true, limit: bidsLimit = 20 } = options;

  const [bids, setBids] = useState<RealtimeBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !auctionId || !db) {
      setLoading(false);
      return;
    }

    try {
      const bidsQuery = query(
        collection(db, 'auctions', auctionId, 'bids'),
        orderBy('createdAt', 'desc'),
        limit(bidsLimit)
      );

      const unsubscribe = onSnapshot(
        bidsQuery,
        (snapshot) => {
          const newBids: RealtimeBid[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            newBids.push({
              id: doc.id,
              amount: data.amount || 0,
              bidderName: data.bidderName || 'Anonimowy',
              createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
              isWinning: data.isWinning || false,
            });
          });
          setBids(newBids);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime bids error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Setup realtime bids error:', err);
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      setLoading(false);
    }
  }, [enabled, auctionId, bidsLimit]);

  return { bids, loading, error };
}
