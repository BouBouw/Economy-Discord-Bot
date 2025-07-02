const { connection, client } = require("../../../..");
const { v4: uuidv4 } = require('uuid');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const Group = {
    /**
     * Crée un groupe ou invite un joueur selon les conditions
     */
    handleGroupRequest: async (message, owner_id, target_id) => {
        // Vérifie si l'owner est déjà dans un groupe
        connection.query(
            `SELECT * FROM groups WHERE owner_id = ? OR JSON_CONTAINS(group_players, ?)`, 
            [owner_id, `"${owner_id}"`],
            (err, results) => {
                if (err) {
                    console.error("Erreur DB:", err);
                    return message.reply("Erreur système");
                }

                if (results.length > 0) {
                    // L'owner est déjà dans un groupe -> invitation
                    Group.invitePlayer(message, results[0].uuid, owner_id, target_id);
                } else {
                    // Création d'un groupe temporaire
                    Group.createTemporaryGroup(message, owner_id, target_id);
                }
            }
        );
    },

    /**
     * Crée un groupe temporaire (attente de confirmation)
     */
    createTemporaryGroup: async (message, owner_id, target_id) => {
        const tempGroup = {
            uuid: uuidv4(),
            owner_id: owner_id,
            group_players: JSON.stringify([owner_id]),
            status: 'pending',
            invited_player: target_id
        };

        connection.query(
            `INSERT INTO groups SET ?`,
            [tempGroup],
            (err) => {
                if (err) {
                    console.error("Erreur création groupe:", err);
                    return message.reply("Erreur création groupe");
                }

                message.reply({
                    content: `Invitation envoyée à <@${target_id}>. Le groupe se créera quand il acceptera.`,
                    allowedMentions: { users: [target_id] }
                });

                // Envoyer un message au target
                message.client.users.fetch(target_id).then(user => {
                    user.send({
                        content: `Vous avez été invité à rejoindre un groupe par ${message.user}. Acceptez-vous?`,
                        components: [Group.createInviteButtons(tempGroup.uuid)]
                    });
                });
            }
        );
    },

    /**
     * Gère l'invitation dans un groupe existant
     */
    invitePlayer: async (message, group_uuid, owner_id, target_id) => {
        // Vérifier que l'inviteur est bien owner
        connection.query(
            `SELECT * FROM groups WHERE uuid = ? AND owner_id = ?`,
            [group_uuid, owner_id],
            (err, results) => {
                if (err || !results[0]) {
                    return message.reply("Vous n'êtes pas propriétaire d'un groupe valide");
                }

                const group = results[0];
                const players = JSON.parse(group.group_players);

                // Vérifier si le joueur est déjà dans le groupe
                if (players.includes(target_id)) {
                    return message.reply("Ce joueur est déjà dans le groupe");
                }

                // Envoyer l'invitation
                client.users.fetch(target_id).then(user => {
                    user.send({
                        content: `Vous avez été invité à rejoindre le groupe par ${message.user} \`(@${message.user.username})\`. Acceptez-vous?`,
                        components: [Group.createInviteButtons(group.uuid)]
                    });
                    message.reply(`Invitation envoyée à <@${target_id}>`);
                }).catch((err) => {
                    console.log(err)
                    message.reply("Impossible d'envoyer l'invitation");
                });
            }
        );
    },

    /**
     * Crée les boutons d'invitation
     */
    createInviteButtons: (group_uuid) => {        
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_invite_${group_uuid}`)
                    .setLabel('Accepter')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`decline_invite_${group_uuid}`)
                    .setLabel('Refuser')
                    .setStyle(ButtonStyle.Danger)
            );
    },

    /**
     * Gère l'acceptation d'une invitation
     */
    handleInviteAccept: async (interaction, group_uuid, user_id) => {
        // Récupérer le groupe
        connection.query(
            `SELECT * FROM groups WHERE uuid = ?`,
            [group_uuid],
            (err, results) => {
                if (err || !results[0]) {
                    return interaction.update({ content: "Groupe invalide", components: [] });
                }

                const group = results[0];
                let players = JSON.parse(group.group_players);

                // Si groupe en attente (nouvelle création)
                if (group.status === 'pending') {
                    // Ajouter le joueur et activer le groupe
                    players.push(user_id);
                    
                    connection.query(
                        `UPDATE groups 
                         SET group_players = ?, status = 'active', invited_player = NULL
                         WHERE uuid = ?`,
                        [JSON.stringify(players), group_uuid],
                        (err) => {
                            if (err) {
                                console.error("Erreur activation groupe:", err);
                                return interaction.update({ content: "Erreur système", components: [] });
                            }

                            interaction.update({ 
                                content: "Groupe créé avec succès!",
                                components: [] 
                            });
                            
                            // Notifier l'owner
                            interaction.client.users.fetch(group.owner_id).then(user => {
                                user.send(`Votre groupe a été créé avec <@${user_id}>!`);
                            });
                        }
                    );
                } 
                // Si groupe existant
                else {
                    // Vérifier qu'il y a de la place
                    if (players.length >= 5) {
                        return interaction.update({ 
                            content: "Le groupe est déjà plein", 
                            components: [] 
                        });
                    }

                    // Ajouter le joueur
                    players.push(user_id);
                    
                    connection.query(
                        `UPDATE groups SET group_players = ? WHERE uuid = ?`,
                        [JSON.stringify(players), group_uuid],
                        (err) => {
                            if (err) {
                                console.error("Erreur ajout joueur:", err);
                                return interaction.update({ content: "Erreur système", components: [] });
                            }

                            interaction.update({ 
                                content: "Vous avez rejoint le groupe!",
                                components: [] 
                            });
                            
                            // Notifier l'owner
                            interaction.client.users.fetch(group.owner_id).then(user => {
                                user.send(`<@${user_id}> a rejoint votre groupe!`);
                            });
                        }
                    );
                }
            }
        );
    },

    /**
     * Retire un joueur d'un groupe
     */
    removePlayer: async (message, owner_id, target_id) => {
        connection.query(
            `SELECT * FROM groups WHERE owner_id = ?`,
            [owner_id],
            (err, results) => {
                if (err || !results[0]) {
                    return message.reply("Vous devez être propriétaire pour retirer un joueur");
                }

                const group = results[0];
                let players = JSON.parse(group.group_players);

                if (!players.includes(target_id)) {
                    return message.reply("Ce joueur n'est pas dans votre groupe");
                }

                // Retirer le joueur
                players = players.filter(id => id !== target_id);

                // Si moins de 2 joueurs, dissoudre le groupe
                if (players.length < 2) {
                    connection.query(
                        `DELETE FROM groups WHERE uuid = ?`,
                        [group.uuid],
                        (err) => {
                            if (err) return message.reply("Erreur lors de la dissolution du groupe");
                            message.reply(`Le groupe a été dissous après le retrait de <@${target_id}>`);
                        }
                    );
                } else {
                    // Mettre à jour le groupe
                    connection.query(
                        `UPDATE groups SET group_players = ? WHERE uuid = ?`,
                        [JSON.stringify(players), group.uuid],
                        (err) => {
                            if (err) return message.reply("Erreur lors du retrait du joueur");
                            message.reply(`<@${target_id}> a été retiré du groupe`);
                        }
                    );
                }
            }
        );
    },

    /**
     * Dissout un groupe
     */
    disbandGroup: async (message, owner_id) => {
        connection.query(
            `DELETE FROM groups WHERE owner_id = ?`,
            [owner_id],
            (err, result) => {
                if (err) {
                    return message.reply("Erreur lors de la dissolution du groupe");
                }

                if (result.affectedRows === 0) {
                    return message.reply("Vous n'êtes propriétaire d'aucun groupe");
                }

                message.reply("Votre groupe a été dissous avec succès");
            }
        );
    },

    /**
     * Affiche les informations d'un groupe
     */
    getGroupInfo: async (message, user_id) => {
        connection.query(
            `SELECT * FROM groups WHERE owner_id = ? OR JSON_CONTAINS(group_players, ?)`,
            [user_id, `"${user_id}"`],
            (err, results) => {
                if (err || !results[0]) {
                    return message.reply("Vous ne faites partie d'aucun groupe");
                }

                const group = results[0];
                const players = JSON.parse(group.group_players);

                // Formater la liste des membres
                const members = players.map(id => `• <@${id}>`).join('\n');

                message.reply({
                    embeds: [{
                        color: 0x0099ff,
                        title: `Informations du groupe [${group.uuid}]`,
                        fields: [
                            { name: "Propriétaire", value: `<@${group.owner_id}>`, inline: true },
                            { name: "Statut", value: group.status === 'active' ? 'Actif' : 'En attente', inline: true },
                            { name: "Membres", value: members || "Aucun membre" }
                        ],
                        timestamp: new Date()
                    }]
                });
            }
        );
    },

    cleanPendingGroups: async () => {
        connection.query(
            `DELETE FROM groups 
             WHERE status = 'pending' 
             AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
            (err) => {
                if (err) console.error("Erreur nettoyage groupes:", err);
            }
        );
    },

    getActiveGroupMembers: async (owner_id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT group_players FROM groups 
                 WHERE owner_id = ? AND status = 'active'`,
                [owner_id],
                (err, results) => {
                    if (err) return reject(err);
                    if (!results[0]) return resolve([]);
                    
                    const players = JSON.parse(results[0].group_players);
                    // Exclure l'owner car il est déjà ajouté
                    resolve(players.filter(id => id !== owner_id));
                }
            );
        });
    }
};

module.exports = Group;