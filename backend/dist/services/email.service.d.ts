export declare const emailService: {
    send(to: string, subject: string, html: string): Promise<void>;
    sendPasswordReset(to: string, token: string): Promise<void>;
    sendLowStockAlert(to: string, productName: string, currentStock: number, minStock: number): Promise<void>;
};
//# sourceMappingURL=email.service.d.ts.map