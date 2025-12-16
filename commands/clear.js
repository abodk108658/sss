const { SlashCommandBuilder, PermissionFlagsBits, Collection } = require('discord.js');

// لإنشاء خريطة تخزين للـ Cooldown
const cooldowns = new Collection();
// مدة الكول داون بالمللي ثانية (6 دقائق = 6 * 60 * 1000 = 360000)
const COOLDOWN_TIME = 6 * 60 * 1000; 

module.exports = {
    // بناء أمر السلاش
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('لحذف عدد محدد من الرسائل (بحد أقصى 10).')
        .addIntegerOption(option =>
            option.setName('عدد_الرسائل')
                .setDescription('عدد الرسائل المراد حذفها (من 1 إلى 10).')
                .setRequired(true)
                .setMinValue(1) // الحد الأدنى
                .setMaxValue(10)) // الحد الأقصى
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // يتطلب صلاحية "إدارة الرسائل"

    async execute(interaction) {
        const amount = interaction.options.getInteger('عدد_الرسائل');
        const userId = interaction.user.id;
        
        // 1. فحص الكول داون (Cooldown Check)
        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;

            if (Date.now() < expirationTime) {
                const timeLeft = expirationTime - Date.now();
                const minutes = Math.floor(timeLeft / (60 * 1000));
                const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
                
                return interaction.reply({ 
                    content: `⏳ الأمر قيد الانتظار (Cooldown). يمكنك استخدامه مرة أخرى بعد **${minutes} دقيقة و ${seconds} ثانية**.`, 
                    ephemeral: true 
                });
            }
        }
        
        // 2. تنفيذ الحذف
        try {
            // استخدام .bulkDelete() لحذف الرسائل
            // نضيف +1 لتضمين رسالة الأمر نفسها
            const deletedMessages = await interaction.channel.bulkDelete(amount, true); 

            // الرد على المستخدم (يتم حذفه تلقائياً بعد 5 ثوانٍ)
            await interaction.reply({ 
                content: `🗑️ تم حذف **${deletedMessages.size}** رسالة بنجاح.`,
                ephemeral: true 
            });
            
            // 3. تطبيق الكول داون
            cooldowns.set(userId, Date.now());
            // إزالة المستخدم من الـ Collection بعد انتهاء الكول داون
            setTimeout(() => cooldowns.delete(userId), COOLDOWN_TIME);

        } catch (error) {
            console.error('حدث خطأ في أمر /clear:', error);
            await interaction.reply({ 
                content: '❌ لم أتمكن من حذف الرسائل. تأكد من أنني أملك صلاحية "إدارة الرسائل" وأن الرسائل عمرها أقل من 14 يوماً.', 
                ephemeral: true 
            });
        }
    },
};
