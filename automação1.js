const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const express = require('express');

const client = new Client({
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
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
      await chat.sendStateTyping();
      await delay(500);
    }

    if (msg.body.toLowerCase().trim() === 'sim' && msg.from.endsWith('@c.us')) {
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(msg.from,
        'Agora vou enviar, meu amor! 💖\n' +
        'Por favor, pague assim que receber😢😢. Tem muita gente de má fé prejudicando meu trabalho.\n\n' +
        'As receitas são exclusivas e perfeitas para quem quer fazer recheios que não vão ao fogão.\n\n' +
        'Estou enviando agora...');

      await delay(1200);

      const arquivos = [
        'BRIGADEIROS.pdf',
        'RECHEIO SEM FOGO 1.pdf',
        'RECHEIO SEM FOGO 2.pdf',
        'RECHEIO SEM FOGO 3.pdf',
        'Sobremesas.pdf'
      ];

      for (const nomeArquivo of arquivos) {
        const caminho = path.resolve(__dirname, nomeArquivo);
        try {
          const media = MessageMedia.fromFilePath(caminho);
          await chat.sendStateTyping();
          await delay(800);
          await client.sendMessage(msg.from, media);
          console.log(`✅ PDF enviado: ${nomeArquivo}`);
          await delay(1500);
        } catch (err) {
          console.error(`❌ Erro ao enviar ${nomeArquivo}:`, err.message);
        }
      }

      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(msg.from,
        'Agora que recebeu, confira que está tudo certinho!\n' +
        'Fico aguardando seu pagamento...\n' +
        'E não esqueça de enviar o comprovante\n\n' +
        'PIX CELULAR\nNome (Meu Filho): Caio\nValor: R$10,90\nBanco: Mercado Pago\nChave: 71991718895\n\n' +
        'Pix abaixo para copiar e colar 👇👇👇');

      await chat.sendStateTyping();
      await delay(1200);
      await client.sendMessage(msg.from, '71991718895');

      await chat.sendStateTyping();
      await delay(1200);
      await client.sendMessage(msg.from, '*BRINDE EXCLUSIVO APÓS SEU PAGAMENTO*');

      await chat.sendStateTyping();
      await delay(1500);
      try {
        const imagem = MessageMedia.fromFilePath(path.resolve(__dirname, 'Capturar.PNG'));
        await client.sendMessage(msg.from, imagem);
        console.log('✅ Imagem enviada');
      } catch (err) {
        console.error('❌ Erro ao enviar imagem:', err.message);
      }

      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(msg.from,
        'Participe do sorteio de uma batedeira todo mês, no dia 30!\n' +
        'Entregamos via correios e sem custo. Basta mandar o comprovante de pagamento das receitas e você já participará automaticamente.');

      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(msg.from,
        'Fico no aguardo do seu pix 😘\n\n' +
        'PIX CELULAR\nNome (Meu Filho): Caio\nValor: R$10,90\nBanco: Mercado Pago\nChave: 71991718895');
    }

  } catch (err) {
    console.error('❌ Erro no bot:', err.message);
  }
});

// 🔁 Servidor web para manter ativo
const app = express();
app.get('/', (req, res) => res.send('Bot do WhatsApp está online!'));
app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor web rodando na porta 3000');
});
