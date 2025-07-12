const qrcodeTerminal = require('qrcode-terminal');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, MessageMedia, RemoteAuth } = require('whatsapp-web.js');

const SESSION_FILE = path.resolve(__dirname, 'session.json');
let latestQr = null;

// Carrega sessão
const sessionData = fs.existsSync(SESSION_FILE)
  ? JSON.parse(fs.readFileSync(SESSION_FILE))
  : null;

const client = new Client({
  authStrategy: new RemoteAuth({
    clientId: 'session',
    store: {
      save: (data) => {
        fs.writeFileSync(SESSION_FILE, JSON.stringify(data));
      },
      load: () => {
        if (fs.existsSync(SESSION_FILE)) {
          return JSON.parse(fs.readFileSync(SESSION_FILE));
        }
        return null;
      },
    },
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('qr', qr => {
  latestQr = qr;
  qrcodeTerminal.generate(qr, { small: true });
  console.log('🟡 Escaneie o QR para conectar no WhatsApp...');
});

client.on('ready', () => {
  console.log('✅ Bot conectado com sucesso!');
});

client.initialize();

client.on('message', async msg => {
  try {
    console.log('📩 Mensagem recebida:', msg.body);
    const chat = await msg.getChat();

    if (/^olá|ola/i.test(msg.body) && msg.from.endsWith('@c.us')) {
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(msg.from,
        'Oii, meu amor💛! Chef Gabriela Mancini aqui 👩🏻‍🍳\n' +
        'Hoje preparei algo especial pra você:\n\n' +
        'Receitas exclusivas, fáceis, saudáveis e deliciosas! 🍞🍫\n' +
        '✅ Recheios que não vão ao fogo\n' +
        '✅ 30 sobremesas low carb\n' +
        '🎁 E ainda: um bônus secreto só hoje!\n' +
        '📲 Acesso vitalício direto no celular\n\n' +
        '🔴Tudo isso por apenas R$ 10,99 no PIX💠\n' +
        '🔴 Somente hoje  ❌⏰\n\n' +
        'Mas antes de liberar tudo...\n' +
        'Posso confiar na sua honestidade pra enviar primeiro as receitas?\n\n' +
        'Digite Sim ou Não');
    }

    if (msg.body.toLowerCase().trim() === 'sim' && msg.from.endsWith('@c.us')) {
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(msg.from,
        'Agora vou enviar, meu amor! 💖\n' +
        'Por favor, pague assim que receber😢😢. Tem muita gente de má fé prejudicando meu trabalho.\n\n' +
        'As receitas são exclusivas e perfeitas para quem quer fazer recheios que não vão ao fogão.\n\n' +
        'Estou enviando agora...');

      const arquivos = [
        'BRIGADEIROS.pdf',
        'RECHEIO SEM FOGO 1.pdf',
        'RECHEIO SEM FOGO 2.pdf',
        'RECHEIO SEM FOGO 3.pdf',
        'Sobremesas.pdf'
      ];

      for (const nomeArquivo of arquivos) {
        const caminho = path.resolve(__dirname, nomeArquivo);
        const media = MessageMedia.fromFilePath(caminho);
        await delay(1500);
        await client.sendMessage(msg.from, media);
        console.log(`✅ PDF enviado: ${nomeArquivo}`);
      }

      await delay(2000);
      await client.sendMessage(msg.from,
        'Agora que recebeu, confira que está tudo certinho!\n' +
        'Fico aguardando seu pagamento...\n' +
        'E não esqueça de enviar o comprovante\n\n' +
        'PIX CELULAR\nNome (Meu Filho): Caio\nValor: R$10,90\nBanco: Mercado Pago\nChave: 71991718895\n\n' +
        'Pix abaixo para copiar e colar 👇👇👇');
      await client.sendMessage(msg.from, '71991718895');
      await client.sendMessage(msg.from, '*BRINDE EXCLUSIVO APÓS SEU PAGAMENTO*');

      try {
        const imagem = MessageMedia.fromFilePath(path.resolve(__dirname, 'Capturar.PNG'));
        await delay(1000);
        await client.sendMessage(msg.from, imagem);
        console.log('✅ Imagem enviada');
      } catch (err) {
        console.error('❌ Erro ao enviar imagem:', err.message);
      }

      await client.sendMessage(msg.from,
        'Participe do sorteio de uma batedeira todo mês, no dia 30!\n' +
        'Entregamos via correios e sem custo. Basta mandar o comprovante de pagamento das receitas e você já participará automaticamente.');

      await client.sendMessage(msg.from,
        'Fico no aguardo do seu pix 😘\n\n' +
        'PIX CELULAR\nNome (Meu Filho): Caio\nValor: R$10,90\nBanco: Mercado Pago\nChave: 71991718895');

      try {
        const audio = MessageMedia.fromFilePath(path.resolve(__dirname, 'audio.opus'));
        await delay(1000);
        await client.sendMessage(msg.from, audio, {
          sendAudioAsVoice: true
        });
        console.log('✅ Áudio enviado');
      } catch (err) {
        console.error('❌ Erro ao enviar áudio:', err.message);
      }
    }
  } catch (err) {
    console.error('❌ Erro no bot:', err.message);
  }
});

// Servidor Express
const app = express();

app.get('/', (req, res) => res.send('🤖 Bot do WhatsApp está online!'));

app.get('/qr', (req, res) => {
  if (!latestQr) {
    return res.send(`
      <h2>✅ Bot já conectado ao WhatsApp</h2>
      <p>Se você quiser forçar novo QR, exclua o arquivo <code>session.json</code> e reinicie o bot.</p>
    `);
  }

  qrcode.toDataURL(latestQr, (err, url) => {
    if (err) return res.status(500).send('Erro ao gerar QR visual');
    res.send(`<h2>Escaneie o QR com seu WhatsApp</h2><img src="${url}" />`);
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Servidor web rodando na porta 3000');
});
