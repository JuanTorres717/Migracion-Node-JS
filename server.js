const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 14 * 60 * 1000 }
}));

// Data
const datosUsuarios = {
    "1144061892": {
        "Número de identificación del cliente": 1144061892,
        "Tipo de identificación del cliente": "CC",
        "Número de póliza": "1010506065201",
        "Correo electrónico": "registrotp16@yopmail.com"
    },
    "52698467": {
        "Número de identificación del cliente": 52698467,
        "Tipo de identificación del cliente": "CC",
        "Número de póliza": "1010506065701",
        "Correo electrónico": "pilito004@yopmail.com"
    },
    "1017325451": {
        "Número de identificación del cliente": 1017325451,
        "Tipo de identificación del cliente": "CC",
        "Número de póliza": "1010506065501",
        "Correo electrónico": "camiloferrer@yopmail.com"
    },
    "79872427": {
        "Número de identificación del cliente": 79872427,
        "Tipo de identificación del cliente": "CC",
        "Número de póliza": "1001501971505",
        "Correo electrónico": "carloslopez@gmail.com"
    },
    "1075232142": {
        "Número de identificación del cliente": 1075232142,
        "Tipo de identificación del cliente": "CC",
        "Número de póliza": "1500510375701",
        "Correo electrónico": "pilito04@yopmail.com"
    },
    "1019045674": {
        "Número de identificación del cliente": 1019045674,
        "Tipo de identificación del cliente": "CC",
        "Número de póliza": "1003692188702",
        "Correo electrónico": "rene@yopmail.com"
    }
};

let conversationTimeouts = {};

// Routes
app.post('/api/chat', async (req, res) => {
    const { prompt, cedula } = req.body;
    const sessionId = req.session.id;

    if (!conversationTimeouts[sessionId]) {
        conversationTimeouts[sessionId] = {
            id: crypto.createHash('sha3-224').update(crypto.randomBytes(12)).digest('hex'),
            lastActivity: Date.now()
        };
    }

    if (Date.now() - conversationTimeouts[sessionId].lastActivity > 14 * 60 * 1000) {
        conversationTimeouts[sessionId].id = crypto.createHash('sha3-224').update(crypto.randomBytes(12)).digest('hex');
        return res.json({ message: "⚠️ La conversación ha expirado. Comienza de nuevo." });
    }

    const userData = datosUsuarios[cedula];
    if (!userData) return res.json({ error: "Usuario no encontrado" });

    try {
        const response = await axios.post(
            'https://ms-makers-agente-agendamiento-bolivar-709427406268.us-east1.run.app/agendamiento-gpt',
            {
                query: prompt,
                Tipo_ID: userData["Tipo de identificación del cliente"],
                num_id: cedula,
                correo: userData["Correo electrónico"],
                negocio: "poliza",
                poliza: userData["Número de póliza"],
                id_conversation: conversationTimeouts[sessionId].id
            }
        );
        
        conversationTimeouts[sessionId].lastActivity = Date.now();
        res.json(response.data);
    } catch (error) {
        res.json({
            message: "¡Ups! Parece que algo está saliendo mal. No puedo ayudarle en este momento, pero no se preocupe, estamos trabajando para solucionarlo, inténtelo nuevamente más tarde ¡Gracias por su comprensión! 💚"
        });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));