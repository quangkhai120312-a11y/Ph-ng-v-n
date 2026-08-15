const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Bot is alive");
    } else {
        res.writeHead(200);
        res.end("Discord Bot");
    }
}).listen(PORT, () => {
    console.log(`Web server chạy tại port ${PORT}`);
});

require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.once(Events.ClientReady, bot => {
    console.log(`Bot online: ${bot.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== 'dangki') return;

    const member = interaction.member;

    const newMemberRole =
        interaction.guild.roles.cache.get(
            process.env.NEW_MEMBER_ROLE_ID
        );

    const memberRole =
        interaction.guild.roles.cache.get(
            process.env.MEMBER_ROLE_ID
        );

    if (!newMemberRole || !memberRole) {
        return interaction.reply({
            content: '❌ Không tìm thấy role.',
            ephemeral: true
        });
    }

    // Chỉ Thành viên mới được đăng ký
    if (!member.roles.cache.has(newMemberRole.id)) {
        return interaction.reply({
            content:
                '❌ M không phải Thành viên mới.',
            ephemeral: true
        });
    }

    const ten =
        interaction.options.getString('ten');

    const namSinh =
        interaction.options.getInteger('namsinh');

    const peakRank =
        interaction.options.getString('peakrank');

    const rankHienTai =
        interaction.options.getString('rankhientai');

    // 2012 → K12
    const khoa = Number(namSinh) >= 2000
  ? `K${Number(String(namSinh).slice(-2))}`
  : String(namSinh).slice(-2);

    try {

        await member.roles.add(
            memberRole,
            'Đăng ký thành viên'
        );

        await member.roles.remove(
            newMemberRole,
            'Đã đăng ký thành viên'
        );

    } catch (error) {

        console.error(error);

        return interaction.reply({
            content:
                '❌ Bot không thể cấp role. Kiểm tra Manage Roles.',
            ephemeral: true
        });
    }

    const channel =
        interaction.guild.channels.cache.get(
            process.env.REGISTER_CHANNEL_ID
        );

    if (!channel) {
        return interaction.reply({
            content:
                '⚠️ Cấp role thành công nhưng không tìm thấy kênh.',
            ephemeral: true
        });
    }
try {
    await channel.send(
        `${member}\n` +
        `**${ten} - ${khoa}**\n` +
        `**Peak Rank:** ${peakRank}\n` +
        `**Rank hiện tại:** ${rankHienTai}`
    );
} catch (error) {
    console.error('Không thể gửi vào kênh đăng ký:', error);

    return interaction.reply({
        content:
            '⚠️ Đã cấp role thành công nhưng bot không có quyền gửi tin vào kênh đăng ký.',
        ephemeral: true
    });
}

    await interaction.reply({
        content:
            `✅ Đăng ký thành công!\n` +
            `Tên: **${ten}**\n` +
            `${khoa}\n` +
            `Peak Rank: **${peakRank}**\n` +
            `Rank hiện tại: **${rankHienTai}**`,
        ephemeral: true
    });
});

client.login(process.env.TOKEN);
