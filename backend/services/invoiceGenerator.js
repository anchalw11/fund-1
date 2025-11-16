import { createCanvas } from 'canvas';

class InvoiceGenerator {
    async generateInvoice(purchaseData) {
        const width = 800;
        const height = 1000;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('INVOICE', width / 2, 80);

        // Company Info
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Fund8r Forex', 50, 150);
        ctx.fillText('123 Trading Lane', 50, 180);
        ctx.fillText('Forex City, FC 12345', 50, 210);

        // Invoice Info
        ctx.textAlign = 'right';
        ctx.fillText(`Invoice #: ${purchaseData.id}`, width - 50, 150);
        ctx.fillText(`Date: ${new Date(purchaseData.created_at).toLocaleDateString()}`, width - 50, 180);

        // Bill To
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('BILL TO', 50, 280);
        ctx.font = '20px Arial';
        ctx.fillText(purchaseData.user.full_name || purchaseData.user.email, 50, 310);
        ctx.fillText(purchaseData.user.email, 50, 340);

        // Table Header
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Description', 50, 420);
        ctx.textAlign = 'right';
        ctx.fillText('Amount', width - 50, 420);

        // Table Line
        ctx.beginPath();
        ctx.moveTo(50, 440);
        ctx.lineTo(width - 50, 440);
        ctx.stroke();

        // Table Content
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${purchaseData.challenge_types.challenge_name} - ${purchaseData.account_size}`, 50, 470);
        ctx.textAlign = 'right';
        ctx.fillText(`$${purchaseData.amount_paid.toFixed(2)}`, width - 50, 470);

        // Total
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Total', width - 200, 550);
        ctx.fillText(`$${purchaseData.amount_paid.toFixed(2)}`, width - 50, 550);
        
        return canvas.toBuffer('image/png');
    }
}

export default new InvoiceGenerator();
