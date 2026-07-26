

export interface PaymentInitParams {
  amountCents: number;
  currency: string;
  email: string;
  metadata: Record<string, string>;
  callbackUrl: string;
}

export interface PaymentInitResult {
  reference: string;
  authorizationUrl: string;
}

export interface PaymentVerifyResult {
  status: "success" | "failed" | "pending";
  reference: string;
  amount: number;
  metadata: Record<string, string>;
}

/**
 * Payment provider interface — swap providers without touching booking logic.
 */
export interface PaymentProvider {
  initializePayment(params: PaymentInitParams): Promise<PaymentInitResult>;
  verifyPayment(reference: string): Promise<PaymentVerifyResult>;
}

/**
 * Paystack implementation.
 */
class PaystackProvider implements PaymentProvider {
  private secretKey: string;
  private baseUrl = "https://api.paystack.co";

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
  }

  async initializePayment(
    params: PaymentInitParams
  ): Promise<PaymentInitResult> {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amountCents,
        email: params.email,
        currency: params.currency,
        metadata: params.metadata,
        callback_url: params.callbackUrl,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Payment initialization failed");
    }

    return {
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    const response = await fetch(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status) {
      return { status: "failed", reference, amount: 0, metadata: {} };
    }

    return {
      status: data.data.status === "success" ? "success" : "failed",
      reference: data.data.reference,
      amount: data.data.amount,
      metadata: data.data.metadata || {},
    };
  }
}

/**
 * Factory to get the active payment provider.
 */
export function getPaymentProvider(): PaymentProvider {
  // Can swap to Stripe here based on config or currency
  return new PaystackProvider();
}
