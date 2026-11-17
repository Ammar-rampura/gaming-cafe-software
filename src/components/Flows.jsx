import { createContext, useContext, useState } from 'react'
import CheckInModal from './CheckInModal'
import CheckoutModal from './CheckoutModal'
import SnacksModal from './SnacksModal'
import { ReceiptModal } from './Receipt'

const Ctx = createContext(null)
export const useFlows = () => useContext(Ctx)

export function FlowProvider({ children }) {
  const [checkIn, setCheckIn] = useState(null)   // { stationId }
  const [checkout, setCheckout] = useState(null) // session
  const [snacks, setSnacks] = useState(null)     // session
  const [receipt, setReceipt] = useState(null)   // session

  return (
    <Ctx.Provider value={{ 
      openCheckIn: (stationId) => setCheckIn({ stationId }), 
      openCheckout: setCheckout, 
      openSnacks: setSnacks,
      openReceipt: setReceipt 
    }}>
      {children}
      {checkIn && <CheckInModal stationId={checkIn.stationId} onClose={() => setCheckIn(null)} />}
      {checkout && <CheckoutModal session={checkout} onClose={() => setCheckout(null)} onPaid={setReceipt} />}
      {snacks && <SnacksModal session={snacks} onClose={() => setSnacks(null)} />}
      {receipt && <ReceiptModal session={receipt} onClose={() => setReceipt(null)} />}
    </Ctx.Provider>
  )
}
