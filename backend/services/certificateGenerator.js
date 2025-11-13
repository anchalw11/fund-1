// services/certificateGenerator.js
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs/promises';

class FuturisticCertificateGenerator {
    constructor() {
        this.colors = {
            purple: '#7C3AED',
            darkBlue: '#1E3A8A',
            blue: '#3B82F6',
            white: '#FFFFFF',
            gold: '#FFD700',
            cyan: '#00D9FF',
            magenta: '#FF00FF',
            neonGreen: '#39FF14',
            darkPurple: '#4A0E4E',
            electricBlue: '#0FF0FC',
            rose: '#FF006E',
            orange: '#FF6B35'
        };
    }

    async generateWelcomeCertificate(userData) {
        const width = 1920;
        const height = 1080;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Futuristic gradient background
        this.createFuturisticBackground(ctx, width, height);
        // Add holographic effect
        this.drawHolographicOverlay(ctx, width, height);
        // Draw tech grid
        this.drawTechGrid(ctx, width, height);
        // Neon border frame
        this.drawNeonBorder(ctx, width, height);
        // Add geometric shapes
        this.drawGeometricElements(ctx, width, height);
        // Draw futuristic lion logo
        await this.drawFuturisticLion(ctx, width / 2, 200);
        // Add glitch effect text
        this.drawGlitchText(ctx, 'CERTIFICATE OF ENROLLMENT', width / 2, 380, 56);

        // Holographic shimmer for subtitle
        ctx.save();
        const gradient = ctx.createLinearGradient(width/2 - 200, 480, width/2 + 200, 480);
        gradient.addColorStop(0, this.colors.cyan);
        gradient.addColorStop(0.5, this.colors.white);
        gradient.addColorStop(1, this.colors.magenta);
        ctx.fillStyle = gradient;
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Welcome to the Future of Trading', width / 2, 480);
        ctx.restore();

        // User name with neon glow
        this.drawNeonText(ctx, userData.name || 'TRADER', width / 2, 580, 72);

        // Futuristic info box
        this.drawInfoBox(ctx, width/2 - 400, 650, 800, 200, [
            'STATUS: ACTIVE TRADER',
            `ACCOUNT ID: ${userData.accountId || 'FX-' + Date.now()}`,
            `CLEARANCE: LEVEL 1`,
            `ISSUED: ${new Date().toISOString().split('T')[0]}`
        ]);

        // Add scanning lines effect
        this.addScanLines(ctx, width, height);
        // Digital signature
        this.drawDigitalSignature(ctx, width / 2, 920);
        // Add corner tech details
        this.drawCornerDetails(ctx, width, height);
        // Particle effects
        this.drawParticles(ctx, width, height);

        return canvas.toBuffer('image/png');
    }

    async generatePassingCertificate(userData) {
        const width = 1920;
        const height = 1080;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Create cyberpunk background
        this.createCyberpunkBackground(ctx, width, height);
        // Add matrix rain effect
        this.drawMatrixRain(ctx, width, height);
        // Hexagonal pattern overlay
        this.drawHexagonPattern(ctx, width, height);
        // Futuristic frame
        this.drawFuturisticFrame(ctx, width, height);
        // Lion logo with hologram effect
        await this.drawHologramLion(ctx, width / 2, 180);
        // Achievement title with electric effect
        this.drawElectricText(ctx, 'ACHIEVEMENT UNLOCKED', width / 2, 360, 64);
        // Phase completed badge
        this.drawBadge(ctx, width / 2, 480, userData.phase || 'EVALUATION');
        // User name in cyber style
        this.drawCyberText(ctx, userData.name || 'TRADER', width / 2, 580);
        // Stats display with futuristic UI
        this.drawStatsDisplay(ctx, width/2 - 350, 650, 700, 150, {
            profit: userData.profit || '10%',
            drawdown: userData.drawdown || '5%',
            winRate: userData.winRate || '75%',
            trades: userData.trades || '142'
        });
        // Add achievement stars
        this.drawAchievementStars(ctx, width / 2, 850, 5);
        // Quantum signature
        this.drawQuantumSignature(ctx, width / 2, 950);
        // Add energy waves
        this.drawEnergyWaves(ctx, width, height);
        // Corner HUD elements
        this.drawHUDElements(ctx, width, height);

        return canvas.toBuffer('image/png');
    }

    async generatePayoutCertificate(userData) {
        const width = 1920;
        const height = 1080;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Create cyberpunk background
        this.createCyberpunkBackground(ctx, width, height);
        // Hexagonal pattern overlay
        this.drawHexagonPattern(ctx, width, height);
        // Futuristic frame
        this.drawFuturisticFrame(ctx, width, height);
        // Lion logo with hologram effect
        await this.drawHologramLion(ctx, width / 2, 180);
        // Title with electric effect
        this.drawElectricText(ctx, 'PAYOUT AUTHORIZED', width / 2, 360, 72);
        // Payout amount with money effect
        this.drawMoneyAmount(ctx, `$${userData.amount || '5,000.00'}`, width / 2, 480);
        // Recipient name with cyber style
        this.drawCyberText(ctx, userData.name || 'TRADER', width / 2, 600);
        // Transaction details in tech box
        this.drawTransactionBox(ctx, width/2 - 400, 700, 800, 120, {
            id: userData.transactionId || 'PAY-TEST-001',
            method: userData.method || 'SWIFT TRANSFER',
            status: 'APPROVED',
            eta: userData.arrivalTime || '1-3 DAYS'
        });
        // Holographic seal
        this.drawHolographicSeal(ctx, width / 2, 900);
        // Add particles
        this.drawParticles(ctx, width, height);
        // Blockchain verification badge
        this.drawBlockchainBadge(ctx, 100, height - 100);

        return canvas.toBuffer('image/png');
    }

    // Background Effects
    createFuturisticBackground(ctx, width, height) {
        // Multi-layer gradient
        const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        bgGradient.addColorStop(0, '#0A0E27');
        bgGradient.addColorStop(0.3, this.colors.darkPurple);
        bgGradient.addColorStop(0.6, this.colors.darkBlue);
        bgGradient.addColorStop(1, '#000000');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        // Add noise texture
        this.addNoiseTexture(ctx, width, height);
    }

    createCyberpunkBackground(ctx, width, height) {
        // Cyberpunk gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FF006E');
        gradient.addColorStop(0.25, '#8338EC');
        gradient.addColorStop(0.5, '#3A86FF');
        gradient.addColorStop(0.75, '#06FFB4');
        gradient.addColorStop(1, '#FF006E');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
    }

    createPremiumBackground(ctx, width, height) {
        // Luxury gradient
        const gradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, width);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.2, '#FFA500');
        gradient.addColorStop(0.4, this.colors.purple);
        gradient.addColorStop(0.7, this.colors.darkBlue);
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        // Add metallic sheen
        const sheen = ctx.createLinearGradient(0, 0, width, height);
        sheen.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        sheen.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = sheen;
        ctx.fillRect(0, 0, width, height);
    }

    // Text Effects
    drawGlitchText(ctx, text, x, y, size) {
        ctx.save();
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        // Red channel
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillText(text, x - 2, y);
        // Blue channel
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fillText(text, x + 2, y);
        // Main text
        ctx.fillStyle = this.colors.white;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawNeonText(ctx, text, x, y, size) {
        ctx.save();
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        // Outer glow
        ctx.shadowColor = this.colors.cyan;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.colors.cyan;
        ctx.fillText(text, x, y);
        // Inner glow
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.colors.white;
        ctx.fillText(text, x, y);
        // Core text
        ctx.shadowBlur = 5;
        ctx.fillStyle = this.colors.white;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawElectricText(ctx, text, x, y, size) {
        ctx.save();
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        // Electric effect
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 - i * 0.04})`;
            ctx.lineWidth = 10 - i * 2;
            ctx.strokeText(text, x, y);
        }
        // Core text with gradient
        const gradient = ctx.createLinearGradient(x - 200, y, x + 200, y);
        gradient.addColorStop(0, this.colors.electricBlue);
        gradient.addColorStop(0.5, this.colors.white);
        gradient.addColorStop(1, this.colors.electricBlue);
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawCyberText(ctx, text, x, y) {
        ctx.save();
        ctx.font = 'bold 64px "Courier New"';
        ctx.textAlign = 'center';
        // Cyber outline
        ctx.strokeStyle = this.colors.neonGreen;
        ctx.lineWidth = 3;
        ctx.strokeText(text, x, y);
        // Fill with gradient
        const gradient = ctx.createLinearGradient(x - 150, y, x + 150, y);
        gradient.addColorStop(0, this.colors.cyan);
        gradient.addColorStop(0.5, this.colors.neonGreen);
        gradient.addColorStop(1, this.colors.cyan);
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawGoldShimmerText(ctx, text, x, y, size) {
        ctx.save();
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = 'center';
        // Gold shimmer gradient
        const shimmer = ctx.createLinearGradient(x - 300, y, x + 300, y);
        shimmer.addColorStop(0, '#FFD700');
        shimmer.addColorStop(0.25, '#FFF8DC');
        shimmer.addColorStop(0.5, '#FFD700');
        shimmer.addColorStop(0.75, '#FFF8DC');
        shimmer.addColorStop(1, '#FFD700');
        // Shadow
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = shimmer;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    // Decorative Elements
    drawTechGrid(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        // Vertical lines
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        // Horizontal lines
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        // Perspective grid at bottom
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.2)';
        const vanishY = height * 0.6;
        const vanishX = width / 2;
        for (let i = 0; i <= 20; i++) {
            ctx.beginPath();
            ctx.moveTo(vanishX, vanishY);
            ctx.lineTo(i * (width / 20), height);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawNeonBorder(ctx, width, height) {
        ctx.save();
        // Multiple glow layers
        const colors = [
            'rgba(0, 255, 255, 0.2)',
            'rgba(0, 255, 255, 0.4)',
            'rgba(0, 255, 255, 0.6)',
            'rgba(0, 255, 255, 1)'
        ];
        colors.forEach((color, index) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 20 - index * 5;
            ctx.strokeRect(
                30 + index * 5,
                30 + index * 5,
                width - 60 - index * 10,
                height - 60 - index * 10
            );
        });
        // Corner accents
        this.drawCornerAccents(ctx, width, height);
        ctx.restore();
    }

    drawCornerAccents(ctx, width, height) {
        const cornerSize = 100;
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 3;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(30, 30 + cornerSize);
        ctx.lineTo(30, 30);
        ctx.lineTo(30 + cornerSize, 30);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(width - 30 - cornerSize, 30);
        ctx.lineTo(width - 30, 30);
        ctx.lineTo(width - 30, 30 + cornerSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(30, height - 30 - cornerSize);
        ctx.lineTo(30, height - 30);
        ctx.lineTo(30 + cornerSize, height - 30);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(width - 30 - cornerSize, height - 30);
        ctx.lineTo(width - 30, height - 30);
        ctx.lineTo(width - 30, height - 30 - cornerSize);
        ctx.stroke();
    }

    drawHexagonPattern(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const size = 30;
        const hexHeight = size * 2;
        const hexWidth = Math.sqrt(3) * size;
        for (let y = 0; y < height; y += hexHeight * 0.75) {
            for (let x = 0; x < width; x += hexWidth) {
                const offsetX = (y / (hexHeight * 0.75)) % 2 ? hexWidth / 2 : 0;
                this.drawHexagon(ctx, x + offsetX, y, size);
            }
        }
        ctx.restore();
    }

    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }

    drawGeometricElements(ctx, width, height) {
        ctx.save();
        // Floating triangles
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.lineWidth = 2;
        // Left triangle
        ctx.beginPath();
        ctx.moveTo(100, height / 2 - 100);
        ctx.lineTo(150, height / 2);
        ctx.lineTo(100, height / 2 + 100);
        ctx.closePath();
        ctx.stroke();
        // Right triangle
        ctx.beginPath();
        ctx.moveTo(width - 100, height / 2 - 100);
        ctx.lineTo(width - 150, height / 2);
        ctx.lineTo(width - 100, height / 2 + 100);
        ctx.closePath();
        ctx.stroke();
        // Circles
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(200, 200, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width - 200, 200, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Info Displays
    drawInfoBox(ctx, x, y, width, height, lines) {
        ctx.save();
        // Box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, width, height);
        // Border
        ctx.strokeStyle = this.colors.cyan;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        // Corner details
        const cornerSize = 10;
        ctx.fillStyle = this.colors.cyan;
        // Top-left corner
        ctx.fillRect(x - 2, y - 2, cornerSize, 3);
        ctx.fillRect(x - 2, y - 2, 3, cornerSize);
        // Top-right corner
        ctx.fillRect(x + width - cornerSize + 2, y - 2, cornerSize, 3);
        ctx.fillRect(x + width - 1, y - 2, 3, cornerSize);
        // Text content
        ctx.fillStyle = this.colors.white;
        ctx.font = '24px "Courier New"';
        ctx.textAlign = 'left';
        lines.forEach((line, index) => {
            const lineY = y + 40 + (index * 35);
            // Add typing cursor effect for last line
            if (index === lines.length - 1) {
                ctx.fillText(line + '_', x + 20, lineY);
            } else {
                ctx.fillText(line, x + 20, lineY);
            }
        });
        ctx.restore();
    }

    drawStatsDisplay(ctx, x, y, width, height, stats) {
        ctx.save();
        // Main container
        ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
        ctx.fillRect(x, y, width, height);
        // Neon border
        ctx.strokeStyle = this.colors.neonGreen;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        // Stats grid
        const statWidth = width / 4;
        let currentX = x;
        Object.entries(stats).forEach(([key, value]) => {
            // Stat container
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.strokeRect(currentX, y, statWidth, height);
            // Label
            ctx.fillStyle = this.colors.cyan;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(key.toUpperCase(), currentX + statWidth/2, y + 30);
            // Value with glow
            ctx.shadowColor = this.colors.neonGreen;
            ctx.shadowBlur = 10;
            ctx.fillStyle = this.colors.neonGreen;
            ctx.font = 'bold 32px "Courier New"';
            ctx.fillText(value, currentX + statWidth/2, y + 70);
            ctx.shadowBlur = 0;
            // Progress bar
            const progress = parseFloat(value) / 100;
            if (!isNaN(progress)) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                ctx.fillRect(currentX + 10, y + 90, statWidth - 20, 10);
                ctx.fillStyle = this.colors.neonGreen;
                ctx.fillRect(currentX + 10, y + 90, (statWidth - 20) * progress, 10);
            }
            currentX += statWidth;
        });
        ctx.restore();
    }

    drawTransactionBox(ctx, x, y, width, height, data) {
        ctx.save();
        // Metallic background
        const bgGradient = ctx.createLinearGradient(x, y, x, y + height);
        bgGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
        bgGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.05)');
        bgGradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(x, y, width, height);
        // border
        ctx.strokeStyle = this.colors.cyan;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        // Display data
        ctx.fillStyle = this.colors.white;
        ctx.font = '20px "Courier New"';
        ctx.textAlign = 'left';
        let lineY = y + 35;
        Object.entries(data).forEach(([key, value]) => {
            ctx.fillStyle = this.colors.cyan;
            ctx.fillText(`${key.toUpperCase()}:`, x + 20, lineY);
            ctx.fillStyle = this.colors.white;
            ctx.fillText(value, x + 200, lineY);
            lineY += 30;
        });
        // Status indicator
        ctx.fillStyle = this.colors.neonGreen;
        ctx.beginPath();
        ctx.arc(x + width - 30, y + height/2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Special Effects
    drawHolographicOverlay(ctx, width, height) {
        ctx.save();
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.05)');
        gradient.addColorStop(0.33, 'rgba(0, 255, 255, 0.05)');
        gradient.addColorStop(0.66, 'rgba(255, 255, 0, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    addScanLines(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 3) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    addNoiseTexture(ctx, width, height) {
        ctx.save();
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const opacity = Math.random() * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.restore();
    }

    drawMatrixRain(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
        ctx.font = '12px monospace';
        const columns = width / 20;
        for (let i = 0; i < columns; i++) {
            const x = i * 20;
            const chars = '01';
            for (let j = 0; j < 10; j++) {
                const y = Math.random() * height;
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, x, y);
            }
        }
        ctx.restore();
    }

    drawParticles(ctx, width, height) {
        ctx.save();
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3;
            const opacity = Math.random() * 0.5;
            ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawPremiumParticles(ctx, width, height) {
        ctx.save();
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawEnergyWaves(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x < width; x += 10) {
                const y = height/2 + Math.sin(x * 0.01 + i) * 50;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    // Logo Variations
    async drawFuturisticLion(ctx, x, y) {
        ctx.save();
        // Holographic lion
        ctx.shadowColor = this.colors.cyan;
        ctx.shadowBlur = 30;
        // Create gradient for lion
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
        gradient.addColorStop(0, this.colors.white);
        gradient.addColorStop(0.5, this.colors.cyan);
        gradient.addColorStop(1, this.colors.electricBlue);
        ctx.fillStyle = gradient;
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦁', x, y);
        // Add tech circle around lion
        ctx.strokeStyle = this.colors.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 20, 80, 0, Math.PI * 2);
        ctx.stroke();
        // Add rotating segments
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x1 = x + Math.cos(angle) * 75;
            const y1 = y - 20 + Math.sin(angle) * 75;
            const x2 = x + Math.cos(angle) * 85;
            const y2 = y - 20 + Math.sin(angle) * 85;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        ctx.restore();
    }

    async drawHologramLion(ctx, x, y) {
        ctx.save();
        // Multiple layers for hologram effect
        const colors = [
            'rgba(0, 255, 255, 0.3)',
            'rgba(255, 0, 255, 0.3)',
            'rgba(255, 255, 0, 0.3)'
        ];
        colors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🦁', x + index * 2, y + index * 2);
        });
        // Main lion
        ctx.fillStyle = this.colors.white;
        ctx.fillText('🦁', x, y);
        // Scan lines through lion
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        for (let i = -60; i < 60; i += 5) {
            ctx.beginPath();
            ctx.moveTo(x - 80, y + i);
            ctx.lineTo(x + 80, y + i);
            ctx.stroke();
        }
        ctx.restore();
    }

    async drawPremiumLion(ctx, x, y) {
        ctx.save();
        // Golden glow
        ctx.shadowColor = this.colors.gold;
        ctx.shadowBlur = 40;
        // Gold gradient lion
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.3, this.colors.gold);
        gradient.addColorStop(0.6, '#FFA500');
        gradient.addColorStop(1, this.colors.gold);
        ctx.fillStyle = gradient;
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🦁', x, y);
        // Crown above lion
        ctx.fillStyle = this.colors.gold;
        ctx.font = '40px Arial';
        ctx.fillText('👑', x, y - 80);
        // Laurel wreath
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(x, y - 20, 100, 120, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Additional UI Elements
    drawBadge(ctx, x, y, text) {
        ctx.save();
        // Badge background
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        // Draw hexagonal badge
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const bx = x + 80 * Math.cos(angle);
            const by = y + 80 * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(bx, by);
            } else {
                ctx.lineTo(bx, by);
            }
        }
        ctx.closePath();
        ctx.fill();
        // Badge border
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Badge text
        ctx.fillStyle = this.colors.white;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y + 8);
        ctx.restore();
    }

    drawAchievementStars(ctx, x, y, count) {
        ctx.save();
        const spacing = 80;
        const startX = x - (spacing * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
            const starX = startX + i * spacing;
            // Star glow
            const gradient = ctx.createRadialGradient(starX, y, 0, starX, y, 30);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            // Draw star
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
                const outerX = starX + 25 * Math.cos(angle);
                const outerY = y + 25 * Math.sin(angle);
                const innerAngle = angle + Math.PI / 5;
                const innerX = starX + 12 * Math.cos(innerAngle);
                const innerY = y + 12 * Math.sin(innerAngle);
                if (j === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            // Star border
            ctx.strokeStyle = this.colors.gold;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    drawDigitalSignature(ctx, x, y) {
        ctx.save();
        // Signature line with tech style
        ctx.strokeStyle = this.colors.cyan;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(x - 200, y);
        ctx.lineTo(x + 200, y);
        ctx.stroke();
        ctx.setLineDash([]);
        // Digital signature text
        ctx.fillStyle = this.colors.cyan;
        ctx.font = '18px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('DIGITALLY SIGNED', x, y + 25);
        ctx.font = '14px "Courier New"';
        ctx.fillText(`Timestamp: ${new Date().toISOString()}`, x, y + 45);
        // QR code placeholder
        this.drawQRPlaceholder(ctx, x + 250, y - 30, 60);
        ctx.restore();
    }

    drawQRPlaceholder(ctx, x, y, size) {
        ctx.save();
        ctx.fillStyle = this.colors.white;
        ctx.fillRect(x, y, size, size);
        ctx.fillStyle = '#000000';
        // Simple QR pattern
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (Math.random() > 0.5) {
                    ctx.fillRect(x + i * 6, y + j * 6, 6, 6);
                }
            }
        }
        // Corner squares
        ctx.fillRect(x, y, 18, 18);
        ctx.fillRect(x + size - 18, y, 18, 18);
        ctx.fillRect(x, y + size - 18, 18, 18);
        ctx.fillStyle = this.colors.white;
        ctx.fillRect(x + 3, y + 3, 12, 12);
        ctx.fillRect(x + size - 15, y + 3, 12, 12);
        ctx.fillRect(x + 3, y + size - 15, 12, 12);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 6, 6, 6);
        ctx.fillRect(x + size - 12, y + 6, 6, 6);
        ctx.fillRect(x + 6, y + size - 12, 6, 6);
        ctx.restore();
    }

    drawHUDElements(ctx, width, height) {
        ctx.save();
        // Top left HUD
        ctx.strokeStyle = this.colors.cyan;
        ctx.fillStyle = this.colors.cyan;
        ctx.font = '12px "Courier New"';
        ctx.strokeRect(50, 50, 200, 100);
        ctx.fillText('SYSTEM: ONLINE', 60, 70);
        ctx.fillText('STATUS: VERIFIED', 60, 90);
        ctx.fillText('SECURITY: MAX', 60, 110);
        // Top right HUD
        ctx.strokeRect(width - 250, 50, 200, 100);
        ctx.textAlign = 'right';
        ctx.fillText(`DATE: ${new Date().toLocaleDateString()}`, width - 60, 70);
        ctx.fillText(`TIME: ${new Date().toLocaleTimeString()}`, width - 60, 90);
        ctx.fillText('BLOCKCHAIN: CONFIRMED', width - 60, 110);
        ctx.restore();
    }

    drawBlockchainBadge(ctx, x, y) {
        ctx.save();
        // Badge background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 60, y - 30, 120, 60);
        ctx.strokeStyle = this.colors.cyan;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 60, y - 30, 120, 60);
        // Chain icon
        ctx.font = '24px Arial';
        ctx.fillStyle = this.colors.cyan;
        ctx.textAlign = 'center';
        ctx.fillText('⛓️', x, y);
        ctx.font = '10px "Courier New"';
        ctx.fillText('BLOCKCHAIN', x, y + 20);
        ctx.fillText('VERIFIED', x, y + 30);
        ctx.restore();
    }

    drawMoneyAmount(ctx, amount, x, y) {
        ctx.save();
        // Money background effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 300, y - 80, 600, 160);
        // Amount with special effects
        ctx.font = 'bold 96px Arial';
        ctx.textAlign = 'center';
        // Shadow layers
        ctx.shadowColor = this.colors.cyan;
        ctx.shadowBlur = 30;
        // Gradient text
        const textGradient = ctx.createLinearGradient(x - 200, y, x + 200, y);
        textGradient.addColorStop(0, this.colors.cyan);
        textGradient.addColorStop(0.5, this.colors.white);
        textGradient.addColorStop(1, this.colors.neonGreen);
        ctx.fillStyle = textGradient;
        ctx.fillText(amount, x, y);
        // Currency symbols around
        ctx.font = '32px Arial';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillText('$', x - 250, y - 30);
        ctx.fillText('€', x + 250, y - 30);
        ctx.fillText('£', x - 250, y + 30);
        ctx.fillText('¥', x + 250, y + 30);
        ctx.restore();
    }

    drawPremiumText(ctx, text, x, y) {
        ctx.save();
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        // Multiple shadow layers for depth
        const shadows = [
            { blur: 50, color: 'rgba(255, 215, 0, 0.3)' },
            { blur: 30, color: 'rgba(255, 215, 0, 0.5)' },
            { blur: 10, color: 'rgba(255, 215, 0, 0.8)' }
        ];
        shadows.forEach(shadow => {
            ctx.shadowBlur = shadow.blur;
            ctx.shadowColor = shadow.color;
            ctx.fillStyle = this.colors.gold;
            ctx.fillText(text, x, y);
        });
        // Final text layer
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.colors.gold;
        const gradient = ctx.createLinearGradient(x - 200, y, x + 200, y);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.25, '#FFFFFF');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(0.75, '#FFFFFF');
        gradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawQuantumSignature(ctx, x, y) {
        ctx.save();
        // Quantum effect background
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 - i * 0.04})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y - 20, 30 + i * 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Signature text
        ctx.fillStyle = this.colors.electricBlue;
        ctx.font = '16px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('QUANTUM SIGNATURE', x, y);
        ctx.font = '12px "Courier New"';
        ctx.fillText(`Hash: ${Math.random().toString(36).substring(2, 15)}`, x, y + 20);
        ctx.restore();
    }

    drawHolographicSeal(ctx, x, y) {
        ctx.save();
        // Holographic circles
        const colors = [this.colors.cyan, this.colors.magenta, this.colors.gold];
        colors.forEach((color, index) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x + index * 5, y + index * 5, 50, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.globalAlpha = 1;
        // Seal text
        ctx.fillStyle = this.colors.white;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SEALED', x, y + 5);
        ctx.restore();
    }

    drawSecurityFeatures(ctx, width, height) {
        ctx.save();
        // Microprint line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '8px Arial';
        const microtext = 'FUND8R-FOREX-SECURE-DOCUMENT-';
        for (let x = 0; x < width; x += 150) {
            ctx.fillText(microtext, x, height - 50);
        }
        // Watermark
        ctx.globalAlpha = 0.05;
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.colors.white;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('FUND8R', 0, 0);
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawFuturisticFrame(ctx, width, height) {
        ctx.save();
        // Main frame
        ctx.strokeStyle = this.colors.electricBlue;
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, width - 80, height - 80);
        // Inner frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 50, width - 100, height - 100);
        // Tech corners
        const cornerLength = 100;
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 3;
        // Enhanced corners with additional details
        this.drawTechCorner(ctx, 40, 40, cornerLength, 'tl');
        this.drawTechCorner(ctx, width - 40, 40, cornerLength, 'tr');
        this.drawTechCorner(ctx, 40, height - 40, cornerLength, 'bl');
        this.drawTechCorner(ctx, width - 40, height - 40, cornerLength, 'br');
        ctx.restore();
    }

    drawTechCorner(ctx, x, y, size, position) {
        ctx.save();
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 3;
        switch(position) {
            case 'tl':
                ctx.beginPath();
                ctx.moveTo(x, y + size);
                ctx.lineTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.stroke();
                // Extra details
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, 10, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'tr':
                ctx.beginPath();
                ctx.moveTo(x - size, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + size);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x - size/2, y + size/2, 10, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'bl':
                ctx.beginPath();
                ctx.moveTo(x, y - size);
                ctx.lineTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + size/2, y - size/2, 10, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'br':
                ctx.beginPath();
                ctx.moveTo(x - size, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y - size);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x - size/2, y - size/2, 10, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
        ctx.restore();
    }

    drawLuxuryFrame(ctx, width, height) {
        ctx.save();
        // Outer gold frame
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FFD700');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 30;
        ctx.strokeRect(25, 25, width - 50, height - 50);
        // Inner decorative frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(60, 60, width - 120, height - 120);
        ctx.setLineDash([]);
        // Diamond decorations in corners
        this.drawDiamond(ctx, 100, 100, 30);
        this.drawDiamond(ctx, width - 100, 100, 30);
        this.drawDiamond(ctx, 100, height - 100, 30);
        this.drawDiamond(ctx, width - 100, height - 100, 30);
        ctx.restore();
    }

    drawDiamond(ctx, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(135, 206, 235, 0.7)');
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    drawDiamondPattern(ctx, width, height) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        const size = 40;
        for (let y = 0; y < height; y += size * 2) {
            for (let x = 0; x < width; x += size * 2) {
                this.drawDiamond(ctx, x, y, size);
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawCornerDetails(ctx, width, height) {
        ctx.save();
        // Technical readouts in corners
        ctx.fillStyle = this.colors.cyan;
        ctx.font = '10px "Courier New"';
        // Top-left
        ctx.textAlign = 'left';
        ctx.fillText('SYS.INIT', 70, 70);
        ctx.fillText('CERT.GEN', 70, 85);
        // Top-right
        ctx.textAlign = 'right';
        ctx.fillText('AUTH.OK', width - 70, 70);
        ctx.fillText('SEC.MAX', width - 70, 85);
        // Bottom-left
        ctx.textAlign = 'left';
        ctx.fillText(`ID:${Date.now()}`, 70, height - 70);
        // Bottom-right
        ctx.textAlign = 'right';
        ctx.fillText('FUND8R.FOREX', width - 70, height - 70);
        ctx.restore();
    }
}

export default new FuturisticCertificateGenerator();
