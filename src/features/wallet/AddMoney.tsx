import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { XCircle, CreditCard, Smartphone } from "lucide-react";
import { walletAPI } from "../../core/api";
import { fmt } from "../../shared/utils";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store";
import PaymentSuccessOverlay from "../../shared/components/PaymentSuccessOverlay";
import { useNotificationStore } from "../../store";

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];
const METHODS = [
  { id: "upi", label: "UPI", icon: <Smartphone size={18} /> },
  { id: "card", label: "Card", icon: <CreditCard size={18} /> },
];

export default function AddMoney() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // 'form' | 'processing' | 'success' | 'failed'
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [txResult, setTxResult] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const user = useAuthStore((state) => state.user);
  const addNtf = useNotificationStore((s) => s.add);
  const [successOpen, setSuccessOpen] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error("Failed to load payment gateway");
    document.body.appendChild(script);
  }, []);

  const onSubmit = async (data) => {
    if (loading) return;
    if (!razorpayLoaded) {
      toast.error("Payment gateway not loaded. Please refresh and try again.");
      return;
    }
    setLoading(true);
    setStep("processing");
    try {
      const orderRes = await walletAPI.createOrder(Number(data.amount));
      const orderData = orderRes.data;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Razorpay key from environment
        amount: orderData.amount, // amount in paise
        currency: orderData.currency || "INR",
        name: "WalletPay",
        description: "Add Money to Wallet",
        order_id: orderData.id || orderData.orderId,
        retry: {
    enabled: false
  },
        handler: async function (response) {
          // Payment successful
          try {
            const verifyRes = await walletAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setTxResult({
              amount: data.amount,
              status: "SUCCESS",
              ref: verifyRes.data?.referenceId || "TXN" + Date.now(),
            });
            setStep("success");
            setSuccessOpen(true);
            addNtf({
              title: "Money added successfully",
              message: `Added ${fmt.currency(data.amount)} to your wallet`,
              severity: "success",
              href: "/transactions",
            });
          } catch (err) {
            setTxResult({
              amount: data.amount,
              status: "FAILED",
              error: typeof err.response?.data === 'string'
  ? err.response.data
  : err.response?.data?.message || 'Verification failed'
            });
            setStep("failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "user@example.com",
        },
        theme: {
          color: "#16b36e", // brand color
        },
        modal: {
          ondismiss: function () {
            setStep("form");
            setLoading(false);
            toast.error("Payment cancelled");
          },
          onfailure: function () {
            setStep("failed");
            setLoading(false);
            setTxResult({
              amount: data.amount,
              status: "FAILED",
              error: "Payment failed",
            });
            toast.error("Payment failed");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setTxResult({
        amount: data.amount,
        status: "FAILED",
        error: err.response?.data?.message || "Order creation failed",
      });
      setStep("failed");
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("form");
    setAmount("");
    setTxResult(null);
  };

  return (
    <div className="max-w-md mx-auto animate-slide-up">
      <div className="mb-6">
        <h1
          className="text-2xl font-black"
          style={{ color: "var(--text-primary)" }}
        >
          Add Money
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Top up your WalletPay balance
        </p>
      </div>

      {/* Processing */}
      {step === "processing" && (
        <div className="card p-8 text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin"
            style={{
              borderColor: "var(--brand) transparent var(--brand) var(--brand)",
            }}
          />
          <p className="font-bold" style={{ color: "var(--text-primary)" }}>
            Processing Payment…
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Please do not close this window
          </p>
        </div>
      )}

      {/* Full-screen success animation auto-dismisses; no button */}
      <PaymentSuccessOverlay
        open={successOpen}
        title="Payment successful"
        subtitle={txResult?.ref ? `Ref: ${txResult.ref}` : undefined}
        amountText={txResult?.amount ? fmt.currency(txResult.amount) : undefined}
        onClose={() => { setSuccessOpen(false); reset(); }}
      />

      {/* Failed */}
      {step === "failed" && (
        <div className="card p-8 text-center animate-slide-up">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.12)" }}
          >
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2
            className="text-xl font-black mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Payment Failed
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {txResult?.error}
          </p>
          <button onClick={reset} className="btn-primary w-full">
            Try Again
          </button>
        </div>
      )}

      {/* Form */}
      {step === "form" && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Amount */}
          <div className="card p-5">
            <label className="label">Enter Amount (₹)</label>
            <input
              className="input-field text-2xl font-black text-center"
              type="number"
              min="1"
              placeholder="0"
              value={amount}
              {...register("amount", {
                required: "Amount required",
                min: { value: 1, message: "Min ₹1" },
              })}
              onChange={(e) => {
                setAmount(e.target.value);
                setValue("amount", e.target.value);
              }}
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1 text-center">
                {errors.amount.message}
              </p>
            )}

            {/* Quick amounts */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setAmount(String(amt));
                    setValue("amount", amt);
                  }}
                  className={`py-2 rounded-xl text-sm font-semibold transition-all border ${
                    Number(amount) === amt
                      ? "text-white border-transparent"
                      : "border-transparent"
                  }`}
                  style={
                    Number(amount) === amt
                      ? { background: "var(--brand)" }
                      : {
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-5">
            <label className="label mb-3 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all font-medium text-sm`}
                  style={
                    method === id
                      ? {
                          borderColor: "var(--brand)",
                          background: "rgba(22,179,110,0.08)",
                          color: "var(--brand)",
                        }
                      : {
                          borderColor: "var(--border)",
                          color: "var(--text-secondary)",
                          background: "var(--bg-tertiary)",
                        }
                  }
                >
                  {icon} {label}
                </button>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
              🔒 Secured by Razorpay. Your payment info is encrypted.
            </p>
          </div>

          {/* Summary */}
          {amount && Number(amount) > 0 && (
            <div className="card p-4 animate-slide-up">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: "var(--text-muted)" }}>Amount</span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {fmt.currency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: "var(--text-muted)" }}>
                  Processing fee
                </span>
                <span className="font-semibold text-green-500">Free</span>
              </div>
              <div
                className="h-px my-2"
                style={{ background: "var(--border)" }}
              />
              <div className="flex justify-between text-sm font-bold">
                <span style={{ color: "var(--text-primary)" }}>Total</span>
                <span style={{ color: "var(--brand)" }}>
                  {fmt.currency(amount)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading
              ? "Processing…"
              : `Pay ${amount ? fmt.currency(amount) : ""}`}
          </button>
        </form>
      )}
    </div>
  );
}
