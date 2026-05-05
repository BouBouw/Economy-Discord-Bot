const prisma = require('../../../database');
const Group = require('./Group');

const GroupDecline = (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('accept_invite_')) {
            const groupId = interaction.customId.split('_')[2];
            Group.handleInviteAccept(interaction, groupId, interaction.user.id);
        } else if (interaction.customId.startsWith('decline_invite_')) {
            const groupId = interaction.customId.split('_')[2];
            prisma.group.findUnique({ where: { uuid: groupId } }).then(group => {
                if (!group) {
                    return interaction.update({ content: "Ce groupe n'existe plus", components: [] });
                }
                if (group.status === 'pending') {
                    prisma.group.delete({ where: { uuid: groupId } }).then(() => {
                        interaction.update({ content: "Invitation refusee - Le groupe a ete annule", components: [] });
                        interaction.client.users.fetch(group.ownerId).then(user => {
                            user.send("<@" + interaction.user.id + "> a refuse votre invitation. Le groupe a ete annule.");
                        }).catch(() => console.log("Impossible de notifier le proprietaire"));
                    }).catch(err => {
                        console.error("Erreur suppression groupe:", err);
                        interaction.update({ content: "Erreur systeme", components: [] });
                    });
                } else {
                    interaction.update({ content: "Invitation refusee", components: [] });
                    interaction.client.users.fetch(group.ownerId).then(user => {
                        user.send("<@" + interaction.user.id + "> a refuse votre invitation a rejoindre le groupe.");
                    }).catch(() => console.log("Impossible de notifier le proprietaire"));
                }
            }).catch(err => {
                console.error("Erreur DB:", err);
                interaction.update({ content: "Erreur systeme", components: [] });
            });
        }
    }
};

module.exports = GroupDecline;
