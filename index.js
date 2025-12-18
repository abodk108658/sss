const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node:cron');
const http = require('http');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ] 
});

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
        }
    }
}

// --- نظام منع السب (Auto-Mod) ---
const blacklistedWords = ['قحبه', 'زب', 'كس', 'منيوك']; 

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    const containsBadWord = blacklistedWords.some(word => message.content.includes(word));
    if (containsBadWord) {
        try {
            await message.delete();
            const warn = await message.channel.send(`⚠️ ممنوع السب يا <@${message.author.id}>!`);
            setTimeout(() => warn.delete(), 3000);
        } catch (err) { console.error("Error deleting message:", err); }
    }
});

// --- الأذكار اليومية (كل يوم 10 صباحاً بتوقيت مكة) ---
cron.schedule('0 10 * * *', async () => {
    const channel = client.channels.cache.get(process.env.DAILY_CHANNEL_ID);
    if (channel) {
        const adkar = ["اللهم بك أصبحنا وبك أمسينا.", "سبحان الله وبحمده.", "الحمد لله رب العالمين."];
        const randomDua = adkar[Math.floor(Math.random() * adkar.length)];
        channel.send(`@everyone\n☀️ **ذكر اليوم:**\n${randomDua}`);
    }
}, { timezone: "Asia/Riyadh" });

// --- معالج أوامر السلاش ---
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'حدث خطأ في التنفيذ!', ephemeral: true });
    }
});

client.once(Events.ClientReady, c => console.log(`✅ جاهز باسم ${c.user.tag}`));

// سرفر Render لإبقاء البوت حياً
http.createServer((req, res) => { res.write("Bot is Live!"); res.end(); }).listen(process.env.PORT || 10000);

client.login(process.env.TOKEN);
