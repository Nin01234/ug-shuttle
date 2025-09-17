## Payments

### Simulation (default)
- Booking pages perform validation and then call `finalizeBooking(ref)`.
- A booking object is written to `localStorage` under `simulated_bookings`.
- A notification is added to `simulated_notifications`.
- This avoids needing a live gateway during demos.

### Paystack Integration
- Component: `src/components/PaystackButton.tsx`.
- Loads `https://js.paystack.co/v1/inline.js`.
- The component accepts `amountGhs, email, phone, name, paystackPublicKey, onSuccess, onClose` and other optional props.
- On success, it calls `onSuccess(reference: string)` which you can store with the booking.

Example usage in a page:
```tsx
<PaystackButton
  amountGhs={fareGhs}
  email={user?.email || ''}
  paystackPublicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
  onSuccess={(ref) => finalizeBooking(ref)}
  label="Pay & Book with Paystack"
/>
```

### Going from Simulation to Real
1. Replace the simulated `localStorage` writes with Supabase inserts into `bookings`.
2. Store `payment_reference` and any gateway metadata.
3. Optionally create a `payments` table for audit.
4. Add a secure server-side verification (webhook or verify API via edge function).

