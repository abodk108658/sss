const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🔄 جاري تحديث أوامر السلاش...');
        await rest.put(
            Routes.applicationCommands("1431428502527279186"), // استبدل بـ Application ID
            { body: commands },
        );
        console.log('✅ تم تسجيل الأوامر بنجاح!');
    } catch (error) {
        console.error(error);
    }
})();
