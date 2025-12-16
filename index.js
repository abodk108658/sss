const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// يُرجى استبدال YOUR_BOT_TOKEN ومعرف القناة (Channel ID) بالقيم الصحيحة.
const TOKEN = 'YOUR_BOT_TOKEN'; 

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
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // تعيين كل أمر جديد في مجموعة client.commands
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[تحذير] الأمر في ${filePath} يفتقر إلى خاصية 'data' أو 'execute' المطلوبة.`);
    }
}

// --- معالج حدث on_ready ---
client.once('ready', () => {
    console.log(`✅ تم تسجيل الدخول باسم: ${client.user.tag}`);
});

// --- معالج حدث on_interaction (لتنفيذ أوامر السلاش) ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`لم يتم العثور على أمر يطابق ${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const replyOptions = {
            content: 'والله شوف الصراحه شوف الصراحه والله في غلط مدري ايش هو لاكن حدث خطا', 
            ephemeral: true 
        };
        // التحقق مما إذا كان قد تم الرد بالفعل
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
});

// تشغيل البوت
client.login(TOKEN);
