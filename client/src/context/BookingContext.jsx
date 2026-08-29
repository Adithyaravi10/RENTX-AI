import { createContext, useState } from 'react';

export const BookingContext = createContext(null);

const initialState = {
  vehicle: null,
  startTime: '',
  endTime: '',
  pickupLat: 12.9716,
  pickupLng: 77.5946,
  dropLat: null,
  dropLng: null,
  signatureData: null,
  pricing: null,
  bookingId: null,
};

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(initialState);
  const [step, setStep] = useState(0);

  const setVehicle = (vehicle) => setBooking((b) => ({ ...b, vehicle }));
  const setDates = (startTime, endTime) => setBooking((b) => ({ ...b, startTime, endTime }));
  const setPricing = (pricing) => setBooking((b) => ({ ...b, pricing }));
  const setSignature = (signatureData) => setBooking((b) => ({ ...b, signatureData }));
  const setBookingId = (bookingId) => setBooking((b) => ({ ...b, bookingId }));
  const resetBooking = () => {
    setBooking(initialState);
    setStep(0);
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        step,
        setStep,
        setVehicle,
        setDates,
        setPricing,
        setSignature,
        setBookingId,
        resetBooking,
        updateBooking: (updates) => setBooking((b) => ({ ...b, ...updates })),
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}
