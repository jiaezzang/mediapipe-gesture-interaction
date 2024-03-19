const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    // 클라이언트에게 연결 메시지를 보냅니다.
    ws.send(JSON.stringify({ type: 'connected' }));

    // 클라이언트로부터 메시지를 수신합니다.
    ws.on('message', message => {
        // 수신한 메시지를 다른 연결된 클라이언트에게 브로드캐스트합니다.
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

server.listen(3000, () => {
    console.log('Signaling server is running on port 3000');
});
