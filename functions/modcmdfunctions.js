const Discord = require("discord.js");
const Message = Discord.Message;

module.exports = (bot = Discord.Client) => {

    /**
        * Setting prefix
        * @param {Message} message 
        */
    setPrefix = function setPrefix(message, command, args, serverSettings) {
        if (args.length === 0) {
            message.channel.send(message.author + "To set prefix please use " + command + " <prefix>")
                .then(message => message.delete(10 * 1000));
            message.delete(10 * 1000);
            return;
        }
        const newPrefix = args[0];
        serverSettings.prefix = newPrefix;
        bot.setServerSettings(message.guild.id, serverSettings);
        message.channel.send("**Prefix has been set to: **" + newPrefix);
        return;
    }

    /**
     * Banning a user
     * @param {Message} message  
     */
    banUser = function banUser(message, command, args, perms) {
        if (args.length === 0) {
            message.channel.send(`Please do ${command} <user> [days] [reason]`);
            return;
        }

        let member_id = null;
        const matches = args[0].match(new RegExp(`<@(\\d+)>`));

        if (matches) {
            member_id = matches[1];
        }

        if (!member_id) {
            member_id = args[0];
        }

        let member = null;

        if (message.guild.members.has(member_id)) {
            member = message.guild.member(member_id);
        }

        if (member === message.member) {
            message.channel.send("You can't ban yourself");
            return;
        }

        if (member) {

            if (member.hasPermission(perms)) {
                message.channel.send("You can't ban that person");
                return;
            }
        }

        let reason = args.slice(1).join(" ");
        let days = 0;
        if (isNaN(args[1])) {
            reason = args.slice(1).join(" ");
        } else {
            days = parseInt(args[1]);
            reason = args.slice(2).join(" ");
        }

        message.guild.ban(member_id, { days, reason }).then((user) => {

            message.channel.send(`**${user}** has been banned`);

        }).catch(() => {

            message.channel.send("Failed to ban user");
        });
    }

    /**
     * Kicks a user
     * @param {Message} message 
     */
    kickUser = function kickUser(message, command, args, perms) {
        if (args.length === 0) {
            message.channel.send(`Please do ${command} <user> [reason]`);
            return;
        }

        let member_id = null;
        const matches = args[0].match(new RegExp(`<@(\\d+)>`));

        if (matches) {
            member_id = matches[1];
        }

        if (!member_id) {
            member_id = args[0];
        }

        let member = null;

        if (message.guild.members.has(member_id)) {
            member = message.guild.member(member_id);
        }

        if (member === message.member) {
            message.channel.send("You can't kick yourself");
            return;
        }

        if (member) {

            if (member.hasPermission(perms)) {
                message.channel.send("You can't kick that person");
                return;
            }
        }

        let reason = args.slice(1).join(" ");

        member.kick(reason).then((member) => {

            message.channel.send(`**${member.displayName}** has been kicked for ${reason}`);

        }).catch(() => {

            message.channel.send("Failed to kick");
        });
    }

    /** 
      * Command: Mute by Average Black Guy#2409
     * Description: Mutes a tagged user. Unmutes if user is already muted.
      * Notes: If no mute role exists, one is made and is given to the user. Requires a mention and only 1 person can be muted at a time.
      */
    muteUser = function muteUser(message, command, args, perms) {
        if (args.length === 0) { // Checks if no args given 
            message.channel.send(`No one to mute, please do ${command} [userid] **or** @user`);
            return;
        }

        let muteRoleExists = false;
        let memberToMute = (message.mentions.users.first() === undefined) ? message.guild.member(args[0]) : message.guild.member(message.mentions.users.first().id); // if theres no mention it grabs whatever is in args
        if (memberToMute === null) { //make sure its actually a member
            message.channel.send("That is not a user");
            return;
        }

        if (memberToMute.id === message.author.id) { //Don't mute yourself 
            message.channel.send("You can't mute yourself");
            return;
        }

        if (memberToMute.hasPermission("ADMINISTRATOR") || memberToMute.hasPermission("MANAGE_GUILD")) { //Don't mute person with clout
            message.channel.send("You can't mute that person");
            return;
        }

        for (let role of message.guild.roles.array()) { //loop through roles
            if (role.name.toLowerCase() === "mute" && memberToMute.roles.has(role.id)) { //find mute role and check if member has it, if they do it unmutes
                muteRoleExists = true;
                memberToMute.removeRole(role).then(member => {
                    message.channel.send(`Unmuted ${member.displayName}`);
                }).catch(err => {
                    message.channel.send("Failed to unmute");
                    console.error(err);
                });
                return;
            } else if (role.name.toLowerCase() === "mute") { //if member doesnt have it and mute role is found, it mutes them
                muteRoleExists = true;
                memberToMute.addRole(role).then(member => {
                    message.channel.send(`Muted ${member.displayName}`);
                }).catch(err => {
                    message.channel.send("Failed to mute");
                    console.error(err);
                });
                return;
            }
        }

        if (!muteRoleExists && !message.guild.member(bot.user.id).hasPermission("MANAGE_ROLES")) { // if no mute role and no admin perms
            message.channel.send(`There was no mute role found and I do not have permission to create a new role.\nPlease create a new role called \"mute\" and try again.`);
        } else if (!muteRoleExists) { // If there is no role named "mute" it creates a new one
            message.guild.createRole({
                name: "mute"
            }).then(muteRole => {
                for (let channel of message.guild.channels.array()) { // loop through channels and make mute role not allow member to send messages
                    channel.overwritePermissions(muteRole, { SEND_MESSAGES: false });
                }
                memberToMute.addRole(muteRole).then(member => { //add mute role to member once creation is done
                    message.channel.send(`There was no mute role found, a new one has been created with the name ${muteRole.name} and added to ${member.displayName}`);
                }).catch(err => {
                    message.channel.send("Failed to mute member");
                    console.error(err);
                });
            });
        }
    }

    /**
     * Sets welcome message
     * @param {Message} message 
     */
    welMsg = function welMsg(message, command, args, serverSettings) {
        if (args.length == 1) {
            message.channel.send("Please enter a welcome message: ({mention} tags the new user, {server} is server name, {user} shows user tag)");
            return;
        }
        let msg = message.content.slice(command.length + 1).slice(args[0].length + 1);
        message.channel.send("Welcome message set as: " + msg)
        serverSettings.welcomeMessage = msg;
        bot.setServerSettings(message.guild.id, serverSettings);
    }

}