import React, { useState } from 'react';
import { Lead } from '../types/crm';
import {
  X,
  FileSpreadsheet,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Send,
  Building,
} from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currency';

interface GstQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onInsertToReply: (quotationText: string) => void;
  brandName?: string;
  currencySymbol?: string;
}

interface QuotationItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
}

export const GstQuotationModal: React.FC<GstQuotationModalProps> = ({
  isOpen,
  onClose,
  lead,
  onInsertToReply,
  brandName = 'OmniSync',
  currencySymbol = '₹',
}) => {
  // Parse initial item from lead or estimated value
  const initialAmount = Math.max(
    10000,
    parseInt(lead.estimatedValue?.replace(/[^0-9]/g, '') || '450000', 10)
  );

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'item-1',
      description: lead.channelDetail?.includes(':')
        ? lead.channelDetail.split(':')[1].trim()
        : `${lead.company || lead.contactName} Commercial Supply Specification`,
      hsnCode: '9403',
      quantity: 1,
      unitPrice: initialAmount,
    },
  ]);

  const [gstType, setGstType] = useState<'intra' | 'inter'>('inter'); // intra: CGST+SGST, inter: IGST 18%
  const [buyerGstin, setBuyerGstin] = useState(
    lead.channel === 'indiamart' ? '29ABCDE1234F1Z8' : ''
  );
  const [paymentTerms, setPaymentTerms] = useState('30% Advance with PO, 70% against dispatch');
  const [validityDays, setValidityDays] = useState('15 Days');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const gstRate = 0.18; // 18%
  const totalGst = Math.round(subtotal * gstRate);
  const cgst = Math.round(totalGst / 2);
  const sgst = Math.round(totalGst / 2);
  const igst = totalGst;
  const grandTotal = subtotal + totalGst;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: 'Commercial Installation & Testing Support',
        hsnCode: '9987',
        quantity: 1,
        unitPrice: 25000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Generate plain text quotation for clipboard or inserting into message draft
  const generateFormattedQuotationText = () => {
    const qNum = `QT-${new Date().getFullYear()}-${lead.id.slice(-4).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let text = `========================================\n`;
    text += `GST ESTIMATE / COMMERCIAL QUOTATION\n`;
    text += `${brandName.toUpperCase()} SOLUTIONS\n`;
    text += `Quotation No: ${qNum} | Date: ${dateStr}\n`;
    text += `========================================\n`;
    text += `Customer: ${lead.contactName} (${lead.company || 'Direct Client'})\n`;
    text += `Phone: ${lead.phone} | Email: ${lead.email}\n`;
    if (buyerGstin) text += `Buyer GSTIN: ${buyerGstin}\n`;
    text += `----------------------------------------\n`;
    text += `LINE ITEMS:\n`;

    items.forEach((it, idx) => {
      const lineTotal = it.quantity * it.unitPrice;
      text += `${idx + 1}. ${it.description} (HSN: ${it.hsnCode})\n`;
      text += `   Qty: ${it.quantity} x ${currencySymbol}${it.unitPrice.toLocaleString('en-IN')} = ${currencySymbol}${lineTotal.toLocaleString('en-IN')}\n`;
    });

    text += `----------------------------------------\n`;
    text += `Taxable Subtotal: ${currencySymbol}${subtotal.toLocaleString('en-IN')}\n`;

    if (gstType === 'intra') {
      text += `CGST @ 9%: ${currencySymbol}${cgst.toLocaleString('en-IN')}\n`;
      text += `SGST @ 9%: ${currencySymbol}${sgst.toLocaleString('en-IN')}\n`;
    } else {
      text += `Integrated GST (IGST) @ 18%: ${currencySymbol}${igst.toLocaleString('en-IN')}\n`;
    }

    text += `TOTAL PAYABLE (Incl. 18% GST): ${currencySymbol}${grandTotal.toLocaleString('en-IN')}\n`;
    text += `----------------------------------------\n`;
    text += `Payment Terms: ${paymentTerms}\n`;
    text += `Quotation Validity: ${validityDays}\n`;
    text += `Bank RTGS/NEFT details and Tax Invoice will be shared upon PO confirmation.\n`;
    text += `========================================`;

    return text;
  };

  const handleCopy = () => {
    const text = generateFormattedQuotationText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInsert = () => {
    const quoteText = generateFormattedQuotationText();
    onInsertToReply(quoteText);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>GST Quotation Generator</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  18% Standard GST
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Prepared for {lead.contactName} ({lead.company || 'Direct Buyer'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Buyer Information Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Customer Name
              </span>
              <span className="font-bold text-white mt-0.5 block truncate">
                {lead.contactName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Company & Phone
              </span>
              <span className="text-slate-200 mt-0.5 block truncate">
                {lead.company || 'Retail Account'} · {lead.phone}
              </span>
            </div>
            <div>
              <label className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
                Buyer GSTIN (Optional)
              </label>
              <input
                type="text"
                value={buyerGstin}
                onChange={(e) => setBuyerGstin(e.target.value)}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Quotation Line Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-[11px]">#{idx + 1}</span>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Item description / specification"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={item.hsnCode}
                      onChange={(e) => handleItemChange(item.id, 'hsnCode', e.target.value)}
                      placeholder="HSN Code"
                      title="HSN / SAC Code"
                      className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'quantity',
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">
                        Unit Rate ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'unitPrice',
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Net Amount</label>
                      <div className="py-1 font-mono font-bold text-white text-xs">
                        {currencySymbol}
                        {(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GST Configuration (CGST+SGST vs IGST) */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">GST Supply Type</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="gstType"
                    checked={gstType === 'inter'}
                    onChange={() => setGstType('inter')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Inter-State (IGST 18%)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="gstType"
                    checked={gstType === 'intra'}
                    onChange={() => setGstType('intra')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Intra-State (CGST 9% + SGST 9%)</span>
                </label>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Taxable Amount (Subtotal):</span>
                <span>
                  {currencySymbol}
                  {subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {gstType === 'intra' ? (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>Central GST (CGST 9%):</span>
                    <span>
                      {currencySymbol}
                      {cgst.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>State GST (SGST 9%):</span>
                    <span>
                      {currencySymbol}
                      {sgst.toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-400">
                  <span>Integrated GST (IGST 18%):</span>
                  <span>
                    {currencySymbol}
                    {igst.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-slate-700">
                <span>Grand Total (Incl. 18% GST):</span>
                <span>
                  {currencySymbol}
                  {grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Terms & Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Quotation Validity
              </label>
              <input
                type="text"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text Quote</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Insert Quote into Reply Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
