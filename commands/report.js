const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('إرسال بلاغ للإدارة')
        .addStringOption(option => 
            option.setName('message').setDescription('محتوى البلاغ').setRequired(true)),

    async execute(interaction) {
        const reportContent = interaction.options.getString('message');
        const reportChannelId = process.env.REPORT_CHANNEL_ID;
        const reportChannel = interaction.client.channels.cache.get(reportChannelId);

        if (!reportChannel) return interaction.reply({ content: '❌ لم يتم ضبط روم البلاغات!', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🚨 بلاغ جديد')
            .setColor(0xFF0000)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`**نص البلاغ:**\n${reportContent}`)
            .setTimestamp();

        await reportChannel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ تم إرسال بلاغك بنجاح.', ephemeral: true });
    }
};
