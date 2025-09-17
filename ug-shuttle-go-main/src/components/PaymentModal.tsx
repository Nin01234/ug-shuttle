import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  amountGhs: number;
  onPaid: (reference: string) => void;
  disabled?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amountGhs, onPaid, disabled }) => {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<'momo' | 'card'>('momo');
  const [phone, setPhone] = useState('');
  const [card, setCard] = useState('');

  const submit = () => {
    const ref = `UGS-MANUAL-${Date.now()}`;
    onPaid(ref);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary" disabled={disabled}>
          Pay & Book (GHS {amountGhs.toFixed(2)})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant={method === 'momo' ? 'default' : 'outline'} onClick={() => setMethod('momo')} className="flex-1">
              <Smartphone className="w-4 h-4 mr-2" /> Mobile Money
            </Button>
            <Button variant={method === 'card' ? 'default' : 'outline'} onClick={() => setMethod('card')} className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" /> Card
            </Button>
          </div>

          {method === 'momo' ? (
            <div className="space-y-2">
              <Label htmlFor="phone">MoMo Number</Label>
              <Input id="phone" placeholder="e.g. 024XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="card">Card Number</Label>
              <Input id="card" placeholder="4242 4242 4242 4242" value={card} onChange={(e) => setCard(e.target.value)} />
            </div>
          )}

          <Button className="w-full" onClick={submit} disabled={method === 'momo' ? phone.length < 9 : card.length < 12}>
            Confirm Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
