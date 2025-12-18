const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const http = require('http');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ] 
});

// تخزين بسيط للتفاعل (سيتم حذفه عند إعادة تشغيل البوت في Render)
const activity = new Map();

// قائمة الأذكار
const adkar = [
    "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.",
    "سبحان الله وبحمده، عدد خلقه، ورضا نفسه، وزنة عرشه، ومداد كلماته.",
    "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً."
];

// --- نظام منع السب ---
const badWords = ['قحبه', 'زب', 'كس', 'منيوك']; 

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // تتبع التفاعل (بسيط)
    const count = activity.get(message.author.id) || 0;
    activity.set(message.author.id, count + 1);

    if (badWords.some(word => message.content.includes(word))) {
        try { await message.delete(); } catch(e) {}
    }
});

// --- الأذكار اليومية (كل يوم الساعة 10 صباحاً مثلاً) ---
cron.schedule('0 10 * * *', async () => {
    const channelId = process.env.DAILY_CHANNEL_ID;
    const channel = client.channels.cache.get(channelId);
    if (channel) {
        const randomDua = adkar[Math.floor(Math.random() * adkar.length)];
        channel.send(`@everyone\n☀️ **ذكر اليوم:**\n${randomDua}`);
    }
}, { timezone: "Asia/Riyadh" });

client.once(Events.ClientReady, () => {
    console.log(`✅ ${client.user.tag} جاهز!`);
});

// (أكمل كود الأوامر كما في النسخة السابقة...)
// ...

http.createServer((req, res) => { res.end("Online"); }).listen(process.env.PORT || 10000);
client.login(process.env.TOKEN);
