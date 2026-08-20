require("dotenv").config();

const http = require("http");

const PORT = process.env.PORT || 3000;


/* =========================
   WEB SERVER
========================= */

http.createServer((req, res) => {

    if (req.url === "/health") {

        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("Bot is alive");

    } else {

        res.writeHead(200);

        res.end("Discord Bot");

    }

}).listen(PORT, () => {

    console.log(`Web server chạy tại port ${PORT}`);

});


/* =========================
   DISCORD
========================= */

const {
    Client,
    GatewayIntentBits,
    Events
} = require("discord.js");


const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]

});


/* =========================
   THỐNG KÊ THÀNH VIÊN / BOT
========================= */

async function updateStatistics() {

    const guild =
        client.guilds.cache.get(
            process.env.GUILD_ID
        );


    if (!guild) {

        console.log("❌ Không tìm thấy server.");

        return;

    }


    try {

        await guild.members.fetch();

    } catch (error) {

        console.error(
            "❌ Không thể tải danh sách thành viên:",
            error
        );

        return;

    }


    /* =========================
       ĐẾM NGƯỜI THẬT
    ========================= */

    const humanCount =
        guild.members.cache.filter(
            member => !member.user.bot
        ).size;


    /* =========================
       ĐẾM BOT
    ========================= */

    const botCount =
        guild.members.cache.filter(
            member => member.user.bot
        ).size;


    /* =========================
       LẤY KÊNH
    ========================= */

    const humanChannel =
        guild.channels.cache.get(
            process.env.HUMAN_COUNT_CHANNEL_ID
        );


    const botChannel =
        guild.channels.cache.get(
            process.env.BOT_COUNT_CHANNEL_ID
        );


    /* =========================
       ĐỔI TÊN KÊNH THÀNH VIÊN
    ========================= */

    if (humanChannel) {

        try {

            await humanChannel.setName(
                `👥 | thành-viên-${humanCount}`
            );

        } catch (error) {

            console.error(
                "❌ Không thể đổi tên kênh thành viên:",
                error
            );

        }

    } else {

        console.log(
            "❌ Không tìm thấy kênh thống kê thành viên."
        );

    }


    /* =========================
       ĐỔI TÊN KÊNH BOT
    ========================= */

    if (botChannel) {

        try {

            await botChannel.setName(
                `🤖 | bot-${botCount}`
            );

        } catch (error) {

            console.error(
                "❌ Không thể đổi tên kênh bot:",
                error
            );

        }

    } else {

        console.log(
            "❌ Không tìm thấy kênh thống kê bot."
        );

    }


    console.log(
        `📊 Thống kê: ${humanCount} thành viên | ${botCount} bot`
    );

}


/* =========================
   BOT ONLINE
========================= */

client.once(Events.ClientReady, async bot => {

    console.log(
        `✅ Bot online: ${bot.user.tag}`
    );


    /* Cập nhật thống kê ngay khi bot online */

    await updateStatistics();


    /* Cập nhật thống kê mỗi 5 phút */

    setInterval(
        updateStatistics,
        5 * 60 * 1000
    );

});


/* =========================
   LỆNH /DANGKI
========================= */

client.on(
    Events.InteractionCreate,
    async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }


        if (interaction.commandName !== "dangki") {
            return;
        }


        const member = interaction.member;


        /* =========================
           LẤY ROLE
        ========================= */

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

                content:
                    "❌ Không tìm thấy role.",

                ephemeral: true

            });

        }


        /* =========================
           CHỈ THÀNH VIÊN MỚI ĐƯỢC ĐĂNG KÝ
        ========================= */

        if (
            !member.roles.cache.has(
                newMemberRole.id
            )
        ) {

            return interaction.reply({

                content:
                    "❌ M không phải Thành viên mới.",

                ephemeral: true

            });

        }


        /* =========================
           LẤY THÔNG TIN
        ========================= */

        const ten =
            interaction.options.getString(
                "ten"
            );


        const namSinh =
            interaction.options.getInteger(
                "namsinh"
            );


        const peakRank =
            interaction.options.getString(
                "peakrank"
            );


        const rankHienTai =
            interaction.options.getString(
                "rankhientai"
            );


        /* =========================
           TÍNH KHÓA

           2012 → K12
           2006 → K6
           1996 → 96
        ========================= */

        const khoa =
            Number(namSinh) >= 2000
                ? `K${Number(
                    String(namSinh).slice(-2)
                )}`
                : String(namSinh).slice(-2);


        /* =========================
           CẤP ROLE THÀNH VIÊN
           XÓA ROLE THÀNH VIÊN MỚI
        ========================= */

        try {

            await member.roles.add(
                memberRole,
                "Đăng ký thành viên"
            );


            await member.roles.remove(
                newMemberRole,
                "Đã đăng ký thành viên"
            );

        } catch (error) {

            console.error(error);

            return interaction.reply({

                content:
                    "❌ Bot không thể cấp role. Kiểm tra Manage Roles.",

                ephemeral: true

            });

        }


        /* =========================
           TÌM KÊNH ĐĂNG KÝ
        ========================= */

        const channel =
            interaction.guild.channels.cache.get(
                process.env.REGISTER_CHANNEL_ID
            );


        if (!channel) {

            return interaction.reply({

                content:
                    "⚠️ Cấp role thành công nhưng không tìm thấy kênh.",

                ephemeral: true

            });

        }


        /* =========================
           GỬI THÔNG TIN VÀO KÊNH
        ========================= */

        try {

            await channel.send(

                `${member}\n` +

                `**${ten} - ${khoa}**\n` +

                `**Peak Rank:** ${peakRank}\n` +

                `**Rank hiện tại:** ${rankHienTai}`

            );

        } catch (error) {

            console.error(
                "Không thể gửi vào kênh đăng ký:",
                error
            );


            return interaction.reply({

                content:
                    "⚠️ Đã cấp role thành công nhưng bot không có quyền gửi tin vào kênh đăng ký.",

                ephemeral: true

            });

        }


        /* =========================
           THÔNG BÁO THÀNH CÔNG
        ========================= */

        await interaction.reply({

            content:

                `✅ Đăng ký thành công!\n` +

                `Tên: **${ten}**\n` +

                `${khoa}\n` +

                `Peak Rank: **${peakRank}**\n` +

                `Rank hiện tại: **${rankHienTai}**`,

            ephemeral: true

        });


        /* Cập nhật thống kê ngay sau khi đăng ký */

        await updateStatistics();

    }
);


/* =========================
   NHẮC THÀNH VIÊN MỚI
   MỖI 48 GIỜ
========================= */

setInterval(async () => {

    const guild =
        client.guilds.cache.get(
            process.env.GUILD_ID
        );


    if (!guild) {
        return;
    }


    try {

        await guild.members.fetch();

    } catch (error) {

        console.error(
            "❌ Không thể tải danh sách thành viên:",
            error
        );

        return;

    }


    /* =========================
       TÌM THÀNH VIÊN MỚI
    ========================= */

    const newMembers =
        guild.members.cache.filter(

            member =>
                member.roles.cache.has(
                    process.env.NEW_MEMBER_ROLE_ID
                )

        );


    /* =========================
       GỬI DM
    ========================= */

    for (
        const member
        of newMembers.values()
    ) {

        try {

            await member.send(
                "🔔 Bạn chưa đăng ký thành viên trong server Valorant Mobile. Hãy dùng `/Dangki` để hoàn tất đăng ký nhé."
            );


            console.log(
                `🔔 Đã nhắc ${member.user.tag}`
            );

        } catch (error) {

            console.log(
                `❌ Không thể gửi DM cho ${member.user.tag}`
            );

        }

    }

}, 48 * 60 * 60 * 1000);


/* =========================
   LOGIN
========================= */

client.login(
    process.env.TOKEN
);
