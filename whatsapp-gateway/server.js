const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');


// ========================================
// EXPRESS
// ========================================

const app = express();

app.use(express.json());

const PORT = 3000;


// ========================================
// WHATSAPP CLIENT
// ========================================

const client = new Client({

    authStrategy: new LocalAuth({
        clientId: 'sas-school'
    }),

    puppeteer: {
        headless: true,

        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }

});


// ========================================
// QR CODE
// ========================================

client.on('qr', (qr) => {

    console.log('');
    console.log('=================================');
    console.log('SCAN QR DENGAN HP SEKOLAH');
    console.log('=================================');

    qrcode.generate(qr, {
        small: true
    });

});


// ========================================
// AUTHENTICATED
// ========================================

client.on('authenticated', () => {

    console.log('WhatsApp berhasil authenticated.');

});


// ========================================
// READY
// ========================================

client.on('ready', () => {

    console.log('');
    console.log('=================================');
    console.log('WHATSAPP BERHASIL TERHUBUNG');
    console.log('=================================');

    console.log(
        'Nomor WhatsApp: ' + client.info.wid.user
    );

});


// ========================================
// AUTH FAILURE
// ========================================

client.on('auth_failure', (message) => {

    console.log('');
    console.log('AUTHENTICATION GAGAL');
    console.log(message);

});


// ========================================
// DISCONNECTED
// ========================================

client.on('disconnected', (reason) => {

    console.log('');
    console.log('WHATSAPP TERPUTUS');
    console.log(reason);

});


// ========================================
// API SEND
// ========================================

app.post('/send', async (req, res) => {

    try {

        const phone = req.body.phone;
        const message = req.body.message;


        // Cek input

        if (!phone || !message) {

            return res.status(400).json({

                success: false,

                message: 'phone dan message wajib diisi'

            });

        }


        // Bersihkan nomor

        let number = String(phone).replace(/\D/g, '');


        // 081234567890
        // menjadi
        // 6281234567890

        if (number.startsWith('0')) {

            number = '62' + number.substring(1);

        }


        const chatId = number + '@c.us';


        console.log('');
        console.log('=================================');
        console.log('REQUEST WHATSAPP');
        console.log('Nomor : ' + number);
        console.log('=================================');


        // Kirim pesan

        const result = await client.sendMessage(
            chatId,
            message
        );


        console.log('WhatsApp berhasil dikirim');


        return res.json({

            success: true,

            message: 'WhatsApp berhasil dikirim'

        });


    } catch (error) {

        console.error('');
        console.error('GAGAL MENGIRIM WHATSAPP');

        console.error(error);


        return res.status(500).json({

            success: false,

            message: 'Gagal mengirim WhatsApp',

            error: error.message

        });

    }

});


// ========================================
// START API SERVER
// ========================================

app.listen(PORT, '127.0.0.1', () => {

    console.log('');
    console.log('=================================');
    console.log('API SERVER AKTIF');
    console.log('http://127.0.0.1:' + PORT);
    console.log('=================================');

});


// ========================================
// START WHATSAPP
// ========================================

console.log('');
console.log('=================================');
console.log('WHATSAPP GATEWAY');
console.log('=================================');
console.log('Memulai WhatsApp...');


client.initialize();