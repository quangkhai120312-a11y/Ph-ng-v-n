require('dotenv').config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

const command = new SlashCommandBuilder()
    .setName('dangki')
    .setDescription('Đăng ký thành viên mới')

    .addStringOption(option =>
        option
            .setName('ten')
            .setDescription('Tên của bạn')
            .setRequired(true)
    )

    .addIntegerOption(option =>
        option
            .setName('namsinh')
            .setDescription('Năm sinh')
            .setRequired(true)
            .setMinValue(1900)
            .setMaxValue(2026)
    )

    .addStringOption(option =>
        option
            .setName('peakrank')
            .setDescription('Peak Rank')
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName('rankhientai')
            .setDescription('Rank hiện tại')
            .setRequired(true)
    );

const rest = new REST({ version: '10' })
    .setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Đang đăng ký /dangki...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: [command.toJSON()]
            }
        );

        console.log('/dangki đã đăng ký thành công.');
    } catch (error) {
        console.error(error);
    }
})();
