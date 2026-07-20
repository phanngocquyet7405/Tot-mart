'use client';

import { Gift, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GiftOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
}

interface GiftOptionsProps {
  options?: GiftOption[];
  onSelect?: (optionId: string | null, message?: string) => void;
  selectedOptionId?: string | null;
  selectedMessage?: string;
}

const defaultOptions: GiftOption[] = [
  {
    id: 'no-gift',
    name: 'No Gift Wrapping',
    description: 'Standard packaging',
    price: 0,
  },
  {
    id: 'standard',
    name: 'Standard Gift Wrap',
    description: 'Beautiful wrapping with ribbon',
    price: 2.99,
  },
  {
    id: 'premium',
    name: 'Premium Gift Box',
    description: 'Luxury gift box with tissue paper',
    price: 5.99,
  },
  {
    id: 'luxury',
    name: 'Luxury Gift Set',
    description: 'Designer box with greeting card',
    price: 9.99,
  },
];

export function GiftOptions({
  options = defaultOptions,
  onSelect,
  selectedOptionId = 'no-gift',
  selectedMessage = '',
}: GiftOptionsProps) {
  const [localSelectedId, setLocalSelectedId] = useState(selectedOptionId);
  const [giftMessage, setGiftMessage] = useState(selectedMessage);
  const [includeMessage, setIncludeMessage] = useState(!!selectedMessage);

  const selectedOption = options.find((opt) => opt.id === localSelectedId);

  const handleSelectOption = (optionId: string) => {
    setLocalSelectedId(optionId);
    onSelect?.(optionId, includeMessage ? giftMessage : '');
  };

  const handleMessageChange = (newMessage: string) => {
    setGiftMessage(newMessage);
    if (includeMessage) {
      onSelect?.(localSelectedId, newMessage);
    }
  };

  const handleIncludeMessageChange = (checked: boolean) => {
    setIncludeMessage(checked);
    if (checked) {
      onSelect?.(localSelectedId, giftMessage);
    } else {
      onSelect?.(localSelectedId, '');
    }
  };

  return (
    <div className="space-y-4 p-5 rounded-lg bg-pink-50 border border-pink-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Gift Options</h3>
          <p className="text-xs text-slate-600">Make it extra special</p>
        </div>
      </div>

      {/* Gift Wrapping Options */}
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
              localSelectedId === option.id
                ? 'bg-white border-pink-600 shadow-sm'
                : 'bg-white/50 border-transparent hover:bg-white hover:border-pink-200'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-0.5">
                  {option.name}
                </div>
                <p className="text-xs text-slate-600">{option.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-pink-600">
                  +${option.price.toFixed(2)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Gift Message Section */}
      {localSelectedId !== 'no-gift' && (
        <div className="space-y-3 pt-3 border-t border-pink-200">
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-message"
              checked={includeMessage}
              onCheckedChange={handleIncludeMessageChange}
            />
            <Label
              htmlFor="include-message"
              className="text-sm font-medium text-slate-900 cursor-pointer"
            >
              Include a gift message
            </Label>
          </div>

          {includeMessage && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write your message here (max 150 characters)..."
                value={giftMessage}
                onChange={(e) => handleMessageChange(e.target.value.slice(0, 150))}
                maxLength={150}
                rows={3}
                className="resize-none text-sm"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  {giftMessage.length}/150 characters
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex gap-2 p-2.5 rounded bg-white/50 border border-pink-100">
        <AlertCircle className="h-4 w-4 text-pink-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700">
          Gift options are added at checkout
        </p>
      </div>
    </div>
  );
}
