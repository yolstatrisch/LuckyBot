const Discord = require("discord.js");

module.exports = (bot = Discord.Client) => {

	//Greeter message

	welcomeMsg = function welcomeMsg(member) {
		if (member.user.bot) return;
		const guild = member.guild;
		const serverSettings = bot.getServerSettings(guild.id);
		if (!serverSettings) return;
		if (!serverSettings.welcomeChannelID) return;
		const welcomeChannelID = serverSettings.welcomeChannelID;

		if (!guild.channels.has(welcomeChannelID)) {
			return;
		}
		const chan = guild.channels.get(welcomeChannelID);
		if (serverSettings.welcomeOn === false) return;
		if (!serverSettings.welcomeMessage) {
			serverSettings.welcomeMessage = bot.getDefaultSettings().welcomeMessage;
			bot.setServerSettings(guild.id, serverSettings);
		}

		let msg = serverSettings.welcomeMessage;
		let mention = member.user;
		let serverName = guild.name;
		let user = member.user.tag;
		let image = serverSettings.welcomeImage;

		msg = msg.replace("{mention}", mention).replace("{server}", serverName).replace("{user}", user);

		let embed = new Discord.RichEmbed()
			.setColor("RANDOM")
			.setThumbnail(member.user.displayAvatarURL)
			.setURL(member.user.displayAvatarURL)
			.setTitle("Member Join!")
			.setDescription(msg)
			.setImage(image);
		chan.send(embed);
	};

	//Join

	joinMsg = async function joinMsg(member) {
		const guild = member.guild;
		const serverSettings = bot.getServerSettings(guild.id);
		if (!serverSettings) return;
		if (!serverSettings.joinChannelID) return;
		const joinChannelID = serverSettings.joinChannelID;

		if (!guild.channels.has(joinChannelID)) {
			return;
		}
		const chan = guild.channels.get(joinChannelID);

		let user = member.user;
		let serverName = guild.name;
		let sharedguilds = 0;

		bot.guilds.forEach(guild => {
			if (member.guild.id !== guild.id && guild.members.has(user.id)) {
				sharedguilds++;
			}
		});

		let bans = bot.guilds.map(guild => guild.fetchBans().catch(() => { }));
		bans = await Promise.all(bans);
		const banned = bans.filter(list => {
			if (!list) return false;
			return list.has(member.id);
		});
		const numOfBans = banned.length;

		let embed = new Discord.RichEmbed()
			.setColor("RANDOM")
			.setThumbnail(member.user.displayAvatarURL)
			.setURL(member.user.displayAvatarURL)
			.setTitle("Member Join!")
			.addField("Account Age", `Account was created on: ${user.createdAt.toUTCString()}\nAccount joined server on: ${member.joinedAt.toUTCString()}`)
			.addField("Shared Servers", `This account shares: ${sharedguilds} other server(s) with Lucky Bot.`)
			.setDescription(`${user} joined the server`);
		if (numOfBans) {
			embed.addField("Bans", `:warning: This user is banned on ${numOfBans} server(s).`);
		} else {
			embed.addField("Bans", `This user is not banned on any servers.`);
		}
		bot.invCache.usedInvite(guild).then(invite => {
			if (invite) {
				embed.setDescription(`${user} joined from ${invite.url} created by ${invite.inviter}. Uses: ${invite.uses}`);
			}
			chan.send(embed);
		}).catch((error) => {
			console.log(error);
		});
	};

	//Leave

	leaveMsg = function leaveMsg(member) {
		const guild = member.guild;
		const serverSettings = bot.getServerSettings(guild.id);
		if (!serverSettings) return;
		if (!serverSettings.joinChannelID) return;
		const joinChannelID = serverSettings.joinChannelID;

		if (!guild.channels.has(joinChannelID)) {
			return;
		}
		const chan = guild.channels.get(joinChannelID);

		let user = member.user;
		let serverName = guild.name;

		let embed = new Discord.RichEmbed()
			.setColor("RANDOM")
			.setThumbnail(member.user.displayAvatarURL)
			.setURL(member.user.displayAvatarURL)
			.setTitle("Member Left!")
			.setDescription(`${user} left the server`);
		chan.send(embed);
	};
};