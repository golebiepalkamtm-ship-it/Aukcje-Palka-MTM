
import { AuctionsPage } from '@/components/auctions/AuctionsPage'

export const metadata = {
  title: 'Aukcje - Gołębie Pocztowe',
  description: 'Przeglądaj i licytuj ekskluzywne gołębie pocztowe z rodowodami.',
}

export default function Auctions() {
  return (
    <main>
      <AuctionsPage />
    </main>
  )
}
