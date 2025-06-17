
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

class MpesaService {
    private static instance: MpesaService;
    private accessToken: string | null = null;

    private constructor() { }

    public static getInstance(): MpesaService {
        if (!MpesaService.instance) {
            MpesaService.instance = new MpesaService();
        }
        return MpesaService.instance;
    }

    private async generateAccessToken(): Promise<string | null> {
        const consumerKey = process.env.MPESA_CONSUMER_KEY!;
        const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
        const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

        try {
            const response = await axios.get(
                "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
                {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                }
            );
            this.accessToken = response.data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error("Failed to get access token", error);
            throw new Error("Unable to generate access token");
        }
    }

    public async stkPush(
        amount: number,
        phoneNumber: string,
        accountReference: string = "Avapay",
        transactionDesc: string = "Buying AVAX with M-Pesa"
    ): Promise<any> {
        const token = this.accessToken ?? (await this.generateAccessToken());

        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, -3); // yyyyMMddHHmmss format

        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString("base64");

        const payload = {
            BusinessShortCode: process.env.MPESA_SHORTCODE!,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: process.env.MPESA_SHORTCODE!,
            PhoneNumber: phoneNumber,
            CallBackURL: process.env.MPESA_CALLBACK_URL!,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc,
        };

        try {
            const response = await axios.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("STK Push failed:", error?.response?.data || error.message);
            throw new Error("STK Push failed");
        }
    }

    public async checkTransactionStatus(checkoutRequestID: string): Promise<any> {
        const token = this.accessToken ?? (await this.generateAccessToken());

        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, -3);

        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString("base64");

        const payload = {
            BusinessShortCode: process.env.MPESA_SHORTCODE!,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID,
        };

        try {
            const response = await axios.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("Transaction check failed:", error?.response?.data || error.message);
            throw new Error("Transaction status check failed");
        }
    }
}

export default MpesaService;
