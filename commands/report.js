const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

// يُرجى استبدال هذا بمعرف قناة البلاغات (Report Channel ID)
const REPORT_CHANNEL_ID = '1450532336566276297'; 

module.exports = {
    // بناء أمر السلاش
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('لإرسال بلاغ أو ملاحظة إلى المسؤولين.')
        .addStringOption(option =>
            option.setName('رسالة')
                .setDescription('الرسالة التي تريد إرسالها كبلاغ.')
                .setRequired(true)),

    async execute(interaction) {
        const messageContent = interaction.options.getString('رسالة');

        try {
            const reportChannel = interaction.client.channels.cache.get(REPORT_CHANNEL_ID);

            if (!reportChannel) {
                await interaction.reply({ 
                    content: '❌ خطأ: لا يمكن العثور على قناة البلاغات المحددة.', 
                    ephemeral: true 
                });
                return;
            }

            // إنشاء Embed
            const reportEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // لون أحمر
                .setTitle('⚠️ بلاغ/ملاحظة جديد')
                .setDescription(`**الرسالة:**\n${messageContent}`)
                .setAuthor({ 
                    name: `مُرسل من: ${interaction.user.tag}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTimestamp()
                .setFooter({ text: `مُرسل في سيرفر: ${interaction.guild.name}` });

            // إرسال البلاغ
            await reportChannel.send({ embeds: [reportEmbed] });

            // الرد على المستخدم بالتأكيد
            await interaction.reply({ 
                content: '✅ تم إرسال بلاغك بنجاح! شكراً لملاحظتك.', 
                ephemeral: true 
            });

        } catch (error) {
            console.error('حدث خطأ في أمر /report:', error);
            await interaction.reply({ 
                content: '❌ حدث خطأ أثناء إرسال البلاغ. الرجاء إبلاغ أحد المسؤولين.', 
                ephemeral: true 
            });
        }
    },
};
