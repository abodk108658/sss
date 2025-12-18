const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const http = require('http'); // أضفنا هذا لضمان استقرار الاستضافة

// استخدام متغير بيئة للتوكن لضمان الخصوصية
const TOKEN = process.env.TOKEN; 

// إنشاء عميل (Client) البوت
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ] 
});

// لتعيين الأوامر وتخزينها
client.commands = new Collection();

// --- تحميل الأوامر من مجلد commands ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[تحذير] الأمر في ${filePath} يفتقر إلى خاصية 'data' أو 'execute' المطلوبة.`);
        }
    }
}

// --- معالج حدث on_ready ---
client.once('ready', () => {
    console.log(`✅ تم تسجيل الدخول باسم: ${client.user.tag}`);
});

// --- معالج حدث on_interaction ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const replyOptions = { content: 'حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});

// سرفر بسيط جداً لإبقاء استضافة Render تعمل ولا تعطي خطأ Port
http.createServer((req, res) => {
    res.write("Bot is running!");
    res.end();
}).listen(process.env.PORT || 10000);

// تشغيل البوت
if (TOKEN) {
    client.login(TOKEN);
} else {
    console.error("❌ خطأ: لم يتم العثور على TOKEN في إعدادات البيئة (Environment Variables).");
}
