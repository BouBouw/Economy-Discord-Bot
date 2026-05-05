const prisma = require('../../../database');
const { v4: uuidv4 } = require('uuid');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const Group = {
    handleGroupRequest: async (message, owner_id, target_id) => {
        const existing = await prisma.group.findFirst({
            where: { OR: [{ ownerId: owner_id }, { groupPlayers: { contains: owner_id } }] }
        });
        if (existing) {
            Group.invitePlayer(message, existing.uuid, owner_id, target_id);
        } else {
            Group.createTemporaryGroup(message, owner_id, target_id);
        }
    },

    createTemporaryGroup: async (message, owner_id, target_id) => {
        const tempGroup = await prisma.group.create({
            data: {
                uuid: uuidv4(),
                ownerId: owner_id,
                groupPlayers: JSON.stringify([owner_id]),
                status: 'pending',
                invitedPlayer: target_id
            }
        });
        message.reply({
            content: "Invitation envoyee a <@" + target_id + ">. Le groupe se creera quand il acceptera.",
            allowedMentions: { users: [target_id] }
        });
        message.client.users.fetch(target_id).then(user => {
            user.send({
                content: "Vous avez ete invite a rejoindre un groupe par " + message.user + ". Acceptez-vous?",
                components: [Group.createInviteButtons(tempGroup.uuid)]
            });
        });
    },

    invitePlayer: async (message, group_uuid, owner_id, target_id) => {
        const group = await prisma.group.findFirst({ where: { uuid: group_uuid, ownerId: owner_id } });
        if (!group) return message.reply("Vous n'etes pas proprietaire d'un groupe valide");
        const players = JSON.parse(group.groupPlayers);
        if (players.includes(target_id)) return message.reply('Ce joueur est deja dans le groupe');
        message.client.users.fetch(target_id).then(user => {
            user.send({
                content: "Vous avez ete invite a rejoindre le groupe par " + message.user + ". Acceptez-vous?",
                components: [Group.createInviteButtons(group.uuid)]
            });
            message.reply("Invitation envoyee a <@" + target_id + ">");
        }).catch(() => message.reply("Impossible d'envoyer l'invitation"));
    },

    createInviteButtons: (group_uuid) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("accept_invite_" + group_uuid).setLabel('Accepter').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("decline_invite_" + group_uuid).setLabel('Refuser').setStyle(ButtonStyle.Danger)
        );
    },

    handleInviteAccept: async (interaction, group_uuid, user_id) => {
        const group = await prisma.group.findUnique({ where: { uuid: group_uuid } });
        if (!group) return interaction.update({ content: 'Groupe invalide', components: [] });
        let players = JSON.parse(group.groupPlayers);
        if (group.status === 'pending') {
            players.push(user_id);
            await prisma.group.update({
                where: { uuid: group_uuid },
                data: { groupPlayers: JSON.stringify(players), status: 'active', invitedPlayer: null }
            });
            interaction.update({ content: 'Groupe cree avec succes!', components: [] });
            interaction.client.users.fetch(group.ownerId)
                .then(user => user.send("Votre groupe a ete cree avec <@" + user_id + ">!"))
                .catch(() => {});
        } else {
            if (players.length >= 5) return interaction.update({ content: 'Le groupe est deja plein', components: [] });
            players.push(user_id);
            await prisma.group.update({ where: { uuid: group_uuid }, data: { groupPlayers: JSON.stringify(players) } });
            interaction.update({ content: 'Vous avez rejoint le groupe!', components: [] });
            interaction.client.users.fetch(group.ownerId)
                .then(user => user.send("<@" + user_id + "> a rejoint votre groupe!"))
                .catch(() => {});
        }
    },

    removePlayer: async (message, owner_id, target_id) => {
        const group = await prisma.group.findFirst({ where: { ownerId: owner_id } });
        if (!group) return message.reply('Vous devez etre proprietaire pour retirer un joueur');
        let players = JSON.parse(group.groupPlayers);
        if (!players.includes(target_id)) return message.reply("Ce joueur n'est pas dans votre groupe");
        players = players.filter(id => id !== target_id);
        if (players.length < 2) {
            await prisma.group.delete({ where: { uuid: group.uuid } });
            message.reply("Le groupe a ete dissous apres le retrait de <@" + target_id + ">");
        } else {
            await prisma.group.update({ where: { uuid: group.uuid }, data: { groupPlayers: JSON.stringify(players) } });
            message.reply("<@" + target_id + "> a ete retire du groupe");
        }
    },

    disbandGroup: async (message, owner_id) => {
        const deleted = await prisma.group.deleteMany({ where: { ownerId: owner_id } });
        if (deleted.count === 0) return message.reply("Vous n'etes proprietaire d'aucun groupe");
        message.reply('Votre groupe a ete dissous avec succes');
    },

    getGroupInfo: async (message, user_id) => {
        const group = await prisma.group.findFirst({
            where: { OR: [{ ownerId: user_id }, { groupPlayers: { contains: user_id } }] }
        });
        if (!group) return message.reply("Vous ne faites partie d'aucun groupe");
        const players = JSON.parse(group.groupPlayers);
        const members = players.map(id => "- <@" + id + ">").join('\n');
        message.reply({
            embeds: [{
                color: 0x0099ff,
                title: "Informations du groupe [" + group.uuid + "]",
                fields: [
                    { name: 'Proprietaire', value: "<@" + group.ownerId + ">", inline: true },
                    { name: 'Statut', value: group.status === 'active' ? 'Actif' : 'En attente', inline: true },
                    { name: 'Membres', value: members || 'Aucun membre' }
                ],
                timestamp: new Date()
            }]
        });
    },

    cleanPendingGroups: async () => {
        const oneHourAgo = new Date(Date.now() - 3600000);
        await prisma.group.deleteMany({ where: { status: 'pending', createdAt: { lt: oneHourAgo } } })
            .catch(err => console.error('Erreur nettoyage groupes:', err));
    },

    getActiveGroupMembers: async (owner_id) => {
        const group = await prisma.group.findFirst({ where: { ownerId: owner_id, status: 'active' } });
        if (!group) return [];
        const players = JSON.parse(group.groupPlayers);
        return players.filter(id => id !== owner_id);
    }
};

module.exports = Group;
