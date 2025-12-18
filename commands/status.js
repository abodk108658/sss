const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('عرض حالة وإحصائيات السيرفر'),

    async execute(interaction) {
        const { guild } = interaction;
        
        // جلب الأعضاء (للتأكد من العدد الصحيح)
        await guild.members.fetch();
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status === 'online').size;

        const embed = new EmbedBuilder()
            .setTitle(`📊 حالة سيرفر: ${guild.name}`)
            .setColor(0x00AE86)
            .addFields(
                { name: '👥 عدد الأعضاء', value: `${totalMembers}`, inline: true },
                { name: '🟢 متواجدين', value: `${onlineMembers}`, inline: true },
                { name: '📅 أنشئ في', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false }
            )
            .setFooter({ text: 'ملاحظة: التفاعل يتم حسابه منذ تشغيل البوت فقط' });

        await interaction.reply({ embeds: [embed] });
    },
};
