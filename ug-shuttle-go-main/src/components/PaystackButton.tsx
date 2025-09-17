import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window { PaystackPop?: any }
}

type Props = {
  amountGhs: number;
  email: string;
  phone?: string;
  name?: string;
  paystackPublicKey: string;
  reference?: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

const PaystackButton: React.FC<Props> = ({
  amountGhs,
  email,
  phone,
  name,
  paystackPublicKey,
  reference,
  onSuccess,
  onClose,
  label = 'Pay with Paystack',
  disabled,
  className,
}) => {
  const [loadingScript, setLoadingScript] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) return;
    setLoadingScript(true);
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setLoadingScript(false);
    script.onerror = () => setLoadingScript(false);
    document.body.appendChild(script);
  }, []);

  const startPayment = () => {
    if (!window.PaystackPop) return;
    const ref = reference || `UGS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: Math.round(amountGhs * 100),
      currency: 'GHS',
      ref,
      channels: ['card', 'mobile_money'],
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'name', value: name || email },
          { display_name: 'Phone', variable_name: 'phone', value: phone || '' },
        ],
      },
      callback: (response: { reference: string }) => {
        onSuccess(response.reference);
      },
      onClose: () => {
        onClose?.();
      },
    });
    handler.openIframe();
  };

  return (
    <Button type="button" onClick={startPayment} disabled={disabled || loadingScript} className={className}>
      {loadingScript ? 'Loading payments…' : label}
    </Button>
  );
};

export default PaystackButton;


