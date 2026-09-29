import React from "react";
import { arenaStore } from "@/lib/store";
import { X, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PoliciesModal({ isOpen, onClose }: PoliciesModalProps) {
  const settings = arenaStore.getSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-neutral-800 rounded-xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="px-2.5 py-1 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 text-xs font-heading font-bold uppercase rounded">
          Legal & Compliance
        </span>
        <h2 className="text-2xl font-bold font-heading text-white uppercase mt-2">
          TERMS, CANCELLATION & REFUND POLICIES
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Effective for all bookings and payments at Pixel Arena Sports LLP.
        </p>

        <div className="mt-6 space-y-6 text-xs text-neutral-300 leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 bg-[#141414] border border-neutral-800 rounded-lg space-y-2">
            <h4 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00E676]" />
              <span>Slot Cancellation & Rescheduling Matrix</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-neutral-400">
              <li>
                <strong>&gt; 12 Hours Prior to Slot:</strong> 100% full refund or free date/time rescheduling without penalty.
              </li>
              <li>
                <strong>4 to 12 Hours Prior to Slot:</strong> 50% refund or one-time slot rescheduling credit.
              </li>
              <li>
                <strong>&lt; 4 Hours Prior to Slot:</strong> Non-refundable due to slot vacancy loss.
              </li>
              <li>
                <strong>Inclement Weather / Waterlogging:</strong> If torrential rain impacts turf playability, slots are automatically rescheduled to any available date of your choice at zero fee.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-4 bg-[#141414] border border-neutral-800 rounded-lg space-y-2">
            <h4 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span>Direct UPI Payment Verification Disclaimer</span>
            </h4>
            <p className="text-neutral-400">
              Pixel Arena uses direct bank-to-bank UPI transfers without third-party payment gateway markups. Customers must input the authentic 12-digit UTR from their bank SMS or payment app receipt. All payments are checked by the arena desk. Reused or fraudulent UTR entries will lead to immediate cancellation and permanent player blacklist.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 bg-[#141414] border border-neutral-800 rounded-lg space-y-2">
            <h4 className="font-heading font-bold text-sm text-white uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Ground Safety & Footwear Rules</span>
            </h4>
            <ul className="space-y-1 list-disc list-inside text-neutral-400">
              <li>Metal spikes and studs are strictly prohibited on the turf. Flat rubber turf shoes or sneakers only.</li>
              <li>Non-marking gum-sole shoes are mandatory for the indoor badminton and pickleball courts.</li>
              <li>Pixel Arena management is not liable for personal belongings left unattended in changing rooms. Digital lockers are provided.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-[#00E676] text-black font-heading font-bold text-xs uppercase rounded"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}

export default PoliciesModal;
