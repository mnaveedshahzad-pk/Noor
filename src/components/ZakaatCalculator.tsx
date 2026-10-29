import React, { useState } from 'react';
import { ZakatCalculation, ZakatDisbursement } from '../types/islamic';
import {
  Coins,
  Calculator,
  Plus,
  CheckCircle2,
  AlertCircle,
  History,
  TrendingDown,
  Info
} from 'lucide-react';

interface ZakaatCalculatorProps {
  calculation: ZakatCalculation;
  onSaveCalculation: (calc: ZakatCalculation) => void;
  disbursements: ZakatDisbursement[];
  onAddDisbursement: (d: ZakatDisbursement) => void;
}

export const ZakaatCalculator: React.FC<ZakaatCalculatorProps> = ({
  calculation,
  onSaveCalculation,
  disbursements,
  onAddDisbursement,
}) => {
  const [data, setData] = useState<ZakatCalculation>(calculation);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New disbursement modal form
  const [recipient, setRecipient] = useState<string>('');
  const [category, setCategory] = useState<ZakatDisbursement['category']>('poor');
  const [amount, setAmount] = useState<number>(100);
  const [notes, setNotes] = useState<string>('');

  const updateField = (field: keyof ZakatCalculation, val: number | boolean) => {
    const updated = { ...data, [field]: val, lastCalculatedDate: new Date().toISOString() };
    setData(updated);
    onSaveCalculation(updated);
  };

  // Nisab benchmarks
  const goldNisabValue = 85 * data.goldPricePerGram; // 85 grams of gold
  const silverNisabValue = 595 * data.silverPricePerGram; // 595 grams of silver
  const activeNisabThreshold = data.useSilverNisab ? silverNisabValue : goldNisabValue;

  // Gold & Silver asset values
  const goldAssetValue = data.goldWeightGrams * data.goldPricePerGram;
  const silverAssetValue = data.silverWeightGrams * data.silverPricePerGram;

  // Gross Zakatable Assets
  const grossAssets =
    data.cashInHand +
    data.cashInBank +
    goldAssetValue +
    silverAssetValue +
    data.investmentShares +
    data.businessMerchandise +
    data.moneyOwedToYou;

  // Net Zakatable Wealth
  const netZakatableWealth = Math.max(0, grossAssets - data.liabilitiesDue);

  // Is Nisab met?
  const isNisabReached = netZakatableWealth >= activeNisabThreshold;

  // 2.5% Zakat Due
  const zakatDue = isNisabReached ? Math.round(netZakatableWealth * 0.025 * 100) / 100 : 0;

  // Total Disbursed from ledger
  const totalDisbursed = disbursements.reduce((sum, d) => sum + d.amount, 0);
  const remainingDue = Math.max(0, zakatDue - totalDisbursed);

  const handleDisbursementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || amount <= 0) return;

    const newRecord: ZakatDisbursement = {
      id: `zakat_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      recipient: recipient.trim(),
      category,
      amount: Number(amount),
      notes: notes.trim(),
    };

    onAddDisbursement(newRecord);
    setShowAddModal(false);
    setRecipient('');
    setNotes('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Zakat Summary & Nisab State */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Net Wealth */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Net Zakatable Wealth
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tabular-nums mt-1">
            ${netZakatableWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Nisab Benchmark: ${activeNisabThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })} (
            {data.useSilverNisab ? 'Silver 595g' : 'Gold 85g'})
          </div>
        </div>

        {/* 2.5% Zakat Due */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-900/10 dark:border-emerald-500/20">
          <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
            Annual Zakat Due (2.5%)
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-950 dark:text-emerald-100 tabular-nums mt-1">
            ${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 mt-1 flex items-center gap-1">
            {isNisabReached ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nisab threshold reached; Zakat is obligatory (Fardh)</span>
              </>
            ) : (
              <>
                <Info className="w-3.5 h-3.5 text-stone-400" />
                <span>Below Nisab threshold; no Zakat required</span>
              </>
            )}
          </div>
        </div>

        {/* Remaining to Disburse */}
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40">
          <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
            Remaining Undisbursed
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-950 dark:text-amber-100 tabular-nums mt-1">
            ${remainingDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            ${totalDisbursed.toLocaleString()} already disbursed in ledger
          </div>
        </div>
      </div>

      {/* Main Grid: Asset Form & Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Asset Inputs (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Zakatable Assets & Deductions</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Input all liquid wealth held for one lunar year (Hawl).
              </p>
            </div>

            {/* Silver vs Gold Nisab toggle */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
              <button
                onClick={() => updateField('useSilverNisab', true)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  data.useSilverNisab
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Silver Nisab (Safest)
              </button>
              <button
                onClick={() => updateField('useSilverNisab', false)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  !data.useSilverNisab
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Gold Nisab
              </button>
            </div>
          </div>

          {/* Form Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Cash in hand */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Cash in Hand ($)
              </label>
              <input
                type="number"
                min="0"
                value={data.cashInHand}
                onChange={(e) => updateField('cashInHand', Math.max(0, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
              />
            </div>

            {/* Cash in bank */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Bank Checking & Savings ($)
              </label>
              <input
                type="number"
                min="0"
                value={data.cashInBank}
                onChange={(e) => updateField('cashInBank', Math.max(0, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
              />
            </div>

            {/* Gold Weight */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Gold Weight Owned (Grams)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={data.goldWeightGrams}
                  onChange={(e) => updateField('goldWeightGrams', Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
                />
                <span className="text-[11px] self-center text-stone-400 whitespace-nowrap">
                  = ${Math.round(goldAssetValue)}
                </span>
              </div>
            </div>

            {/* Silver Weight */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Silver Weight Owned (Grams)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={data.silverWeightGrams}
                  onChange={(e) => updateField('silverWeightGrams', Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
                />
                <span className="text-[11px] self-center text-stone-400 whitespace-nowrap">
                  = ${Math.round(silverAssetValue)}
                </span>
              </div>
            </div>

            {/* Investment shares */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Stocks, Shares & Mutual Funds ($)
              </label>
              <input
                type="number"
                min="0"
                value={data.investmentShares}
                onChange={(e) => updateField('investmentShares', Math.max(0, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
              />
            </div>

            {/* Business merchandise */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Trade Inventory / Merchandise ($)
              </label>
              <input
                type="number"
                min="0"
                value={data.businessMerchandise}
                onChange={(e) => updateField('businessMerchandise', Math.max(0, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
              />
            </div>

            {/* Debts owed to you */}
            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                Money Owed to You ($)
              </label>
              <input
                type="number"
                min="0"
                value={data.moneyOwedToYou}
                onChange={(e) => updateField('moneyOwedToYou', Math.max(0, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-sm"
              />
            </div>

            {/* Liabilities due now */}
            <div>
              <label className="block font-medium text-rose-700 dark:text-rose-400 mb-1">
                Less: Immediate Debts & Bills Due ($)
              </label>
              <input
                type="number"
                min="0"
                value={data.liabilitiesDue}
                onChange={(e) => updateField('liabilitiesDue', Math.max(0, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 font-mono text-sm"
              />
            </div>
          </div>

          {/* Editable Spot Rates Sub-card */}
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-stone-600 dark:text-stone-400 font-medium">
              Spot Metal Rates Configuration:
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <span>Gold $/g:</span>
                <input
                  type="number"
                  step="0.5"
                  value={data.goldPricePerGram}
                  onChange={(e) => updateField('goldPricePerGram', Math.max(1, Number(e.target.value)))}
                  className="w-16 p-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-xs"
                />
              </label>

              <label className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                <span>Silver $/g:</span>
                <input
                  type="number"
                  step="0.05"
                  value={data.silverPricePerGram}
                  onChange={(e) => updateField('silverPricePerGram', Math.max(0.1, Number(e.target.value)))}
                  className="w-16 p-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-xs"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right: Zakat Disbursements Ledger (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#101c19] border border-stone-200/80 dark:border-emerald-500/10 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-700" />
                <span>Disbursements Ledger</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Track payments made to the 8 Quranic categories (9:60).
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Payment</span>
            </button>
          </div>

          {/* Disbursements List */}
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {disbursements.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                No disbursements logged yet. Click "+ Log Payment" to record your charitable distribution.
              </p>
            ) : (
              disbursements.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-stone-200/70 dark:border-stone-800 space-y-1 hover:border-emerald-600/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {item.recipient}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="capitalize">{item.category.replace('_', ' ')}</span>
                    <span>{item.date}</span>
                  </div>

                  {item.notes && (
                    <p className="text-[11px] text-stone-400 italic pt-0.5">{item.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Log Disbursement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101c19] border border-stone-200 dark:border-emerald-500/20 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Log Zakat Disbursement
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisbursementSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Recipient / Relief Organization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local Food Bank or Needy Family"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category (Quran 9:60)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ZakatDisbursement['category'])}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  >
                    <option value="poor">Fuqara (The Poor)</option>
                    <option value="needy">Masakin (The Needy)</option>
                    <option value="debtors">Gharimin (In Debt)</option>
                    <option value="fi_sabilillah">Fi Sabilillah (In God's Cause)</option>
                    <option value="wayfarer">Ibn as-Sabil (Wayfarer)</option>
                    <option value="other">Other Permissible</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Notes / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="Optional details or confirmation ID"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-800 text-white font-semibold hover:bg-emerald-900"
                >
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
