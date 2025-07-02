const { connection } = require("../../../..");
const Group = require("./Group");

const GroupDecline = (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('accept_invite_')) {
            const groupId = interaction.customId.split('_')[2];
            Group.handleInviteAccept(interaction, groupId, interaction.user.id);
        }
        else if (interaction.customId.startsWith('decline_invite_')) {
            const groupId = interaction.customId.split('_')[2];
            connection.query(
                `SELECT * FROM groups WHERE uuid = ?`,
                [groupId],
                (err, results) => {
                    if (err || !results[0]) {
                        return interaction.update({ 
                            content: "Ce groupe n'existe plus", 
                            components: [] 
                        });
                    }
    
                    const group = results[0];

                    if (group.status === 'pending') {
                        connection.query(
                            `DELETE FROM groups WHERE uuid = ?`,
                            [groupId],
                            (err) => {
                                if (err) {
                                    console.error("Erreur suppression groupe:", err);
                                    return interaction.update({ 
                                        content: "Erreur système", 
                                        components: [] 
                                    });
                                }
    
                                interaction.update({ 
                                    content: "Invitation refusée - Le groupe a été annulé", 
                                    components: [] 
                                });
    
                                interaction.client.users.fetch(group.owner_id).then(user => {
                                    user.send(`<@${interaction.user.id}> a refusé votre invitation. Le groupe a été annulé.`);
                                }).catch(() => console.log("Impossible de notifier le propriétaire"));
                            }
                        );
                    } else {
                        interaction.update({ 
                            content: "Invitation refusée", 
                            components: [] 
                        });
    
                        interaction.client.users.fetch(group.owner_id).then(user => {
                            user.send(`<@${interaction.user.id}> a refusé votre invitation à rejoindre le groupe.`);
                        }).catch(() => console.log("Impossible de notifier le propriétaire"));
                    }
                }
            );
        }
    }
}

module.exports = GroupDecline;