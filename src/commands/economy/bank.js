const { ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Profiles = require('../../../handlers/functions/Profiles'); // Assure-toi que ce chemin est correct
const Bank = require('../../../handlers/functions/Economy/Bank');
const ImageGenerator = require('../../../handlers/functions/Images/Imagegenerator');

module.exports = {
    name: 'bank',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
    execute: async (client, interaction, args, con) => {
        // Récupérer le profil de l'utilisateur
        const profile = await Profiles.getProfile(interaction.user);

        // Créer un canvas
        try {
            const bank_balance = await ImageGenerator.BankBalance(interaction, profile);

            // Répondre à l'interaction avec les composants
            const msg = await interaction.reply({
                files: [bank_balance],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('bank.deposit_all')
                            .setLabel("Déposer tout")
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('bank.deposit')
                            .setLabel("Déposer un montant")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('bank.withdraw')
                            .setLabel("Retirer un montant")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('bank.withdraw_all')
                            .setLabel("Retirer tout")
                            .setStyle(ButtonStyle.Danger),
                    ),
                    new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('bank.selects')
                            .setPlaceholder('Sélectionnez une option')
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setValue("bank.e_wallet")
                                    .setLabel("Portefeuille électronique")
                                    .setDescription("Consulter votre portefeuille électronique")
                                    .setEmoji("🪙"),
                                new StringSelectMenuOptionBuilder()
                                    .setValue("bank.interests")
                                    .setLabel("Intérêts & Investissements")
                                    .setDescription("Consulter votre livret A et vos investissements")
                                    .setEmoji("📈"),
                                new StringSelectMenuOptionBuilder()
                                    .setValue("bank.credit_card")
                                    .setLabel("Carte de Crédit")
                                    .setDescription("Consulter votre offre de carte de crédit")
                                    .setEmoji("💳"),
                            )
                    )
                ],
                fetchReply: true // Récupérer l'objet Message pour interagir avec
            });

            // Filtres pour les interactions
            const buttonFilter = (i) => i.user.id === interaction.user.id && i.isButton();
            const selectFilter = (i) => i.user.id === interaction.user.id && i.isStringSelectMenu();

            // Gestion des interactions
            const collector = msg.createMessageComponentCollector({
                filter: (i) => buttonFilter(i) || selectFilter(i),
                time: 600_000, // 10 minutes de délai
            });

            collector.on('collect', async (i) => {
                if (i.isButton()) {
                    await handleButtonInteraction(i);
                } else if (i.isStringSelectMenu()) {
                    await handleSelectInteraction(i);
                }
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }); // Désactiver les composants après la fin
            });

            // Fonction pour gérer les interactions de boutons
            async function handleButtonInteraction(interaction) {
                switch (interaction.customId) {
                    case 'bank.deposit': {
                        const modal = new ModalBuilder()
                            .setCustomId('bank.deposit_modal')
                            .setTitle("Déposer un montant");

                        const input = new TextInputBuilder()
                            .setCustomId('bank.deposit_input')
                            .setLabel("Montant à déposer")
                            .setPlaceholder('Entrez un montant')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const row = new ActionRowBuilder().addComponents(input);
                        modal.addComponents(row);

                        await interaction.showModal(modal);

                        try {
                            const modalResponse = await interaction.awaitModalSubmit({ time: 60_000 });
                            const amount = modalResponse.fields.getTextInputValue('bank.deposit_input');
                            const depositAmount = parseFloat(amount);

                            if (isNaN(depositAmount) || depositAmount <= 0) {
                                await modalResponse.reply({ content: 'Montant invalide. Veuillez entrer un nombre positif.', ephemeral: true });
                                return;
                            }

                            await Bank.bankDepositAmount(interaction.user, depositAmount);
                            const new_profile = await Profiles.getProfile(interaction.user);
                            const bank_balance = await ImageGenerator.BankBalance(interaction, new_profile);

                            await modalResponse.reply({ content: `Vous avez déposé **${depositAmount}€** avec succès.`, ephemeral: true });
                            await interaction.editReply({
                                files: [bank_balance],
                                components: [
                                    new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                        .setCustomId('bank.deposit_all')
                                        .setLabel("Déposer tout")
                                        .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                        .setCustomId('bank.deposit')
                                        .setLabel("Déposer un montant")
                                        .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                        .setCustomId('bank.withdraw')
                                        .setLabel("Retirer un montant")
                                        .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                        .setCustomId('bank.withdraw_all')
                                        .setLabel("Retirer tout")
                                        .setStyle(ButtonStyle.Danger),
                                    ),
                                    new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                        .setCustomId('bank.selects')
                                        .setPlaceholder('Sélectionnez une option')
                                        .addOptions(
                                            new StringSelectMenuOptionBuilder()
                                            .setValue("bank.e_wallet")
                                            .setLabel("Portefeuille électronique")
                                            .setDescription("Consulter votre portefeuille électronique")
                                            .setEmoji("🪙"),
                                            new StringSelectMenuOptionBuilder()
                                            .setValue("bank.interests")
                                            .setLabel("Intérêts & Investissements")
                                            .setDescription("Consulter votre livret A et vos investissements")
                                            .setEmoji("📈"),
                                            new StringSelectMenuOptionBuilder()
                                            .setValue("bank.credit_card")
                                            .setLabel("Carte de Crédit")
                                            .setDescription("Consulter votre offre de carte de crédit")
                                            .setEmoji("💳"),
                                        )
                                    )
                                ]     
                            });
                        } catch (err) {
                            console.error('Erreur lors de la collecte de la réponse :', err);
                            await interaction.followUp({ content: 'Vous avez mis trop de temps à répondre. Veuillez réessayer.', ephemeral: true });
                        }
                        break;
                    }

                    case 'bank.deposit_all': {
                        await interaction.deferUpdate();
                        await Bank.bankDepositAll(interaction.user);

                        const new_profile = await Profiles.getProfile(interaction.user);
                        const bank_balance = await ImageGenerator.BankBalance(interaction, new_profile);

                        await interaction.editReply({
                            files: [bank_balance],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('bank.deposit_all')
                                            .setLabel("Déposer tout")
                                            .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                            .setCustomId('bank.deposit')
                                            .setLabel("Déposer un montant")
                                            .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                            .setCustomId('bank.withdraw')
                                            .setLabel("Retirer un montant")
                                            .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                            .setCustomId('bank.withdraw_all')
                                            .setLabel("Retirer tout")
                                            .setStyle(ButtonStyle.Danger),
                                    ),
                                new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('bank.selects')
                                            .setPlaceholder('Sélectionnez une option')
                                            .addOptions(
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.e_wallet")
                                                    .setLabel("Portefeuille électronique")
                                                    .setDescription("Consulter votre portefeuille électronique")
                                                    .setEmoji("🪙"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.interests")
                                                    .setLabel("Intérêts & Investissements")
                                                    .setDescription("Consulter votre livret A et vos investissements")
                                                    .setEmoji("📈"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.credit_card")
                                                    .setLabel("Carte de Crédit")
                                                    .setDescription("Consulter votre offre de carte de crédit")
                                                    .setEmoji("💳"),
                                            )
                                    )
                            ]
                        });
                        break;
                    }

                    case 'bank.withdraw': {
                        const modal = new ModalBuilder()
                            .setCustomId('bank.withdraw_modal')
                            .setTitle("Retirer un montant");

                        const input = new TextInputBuilder()
                            .setCustomId('bank.withdraw_input')
                            .setLabel("Montant à retirer")
                            .setPlaceholder('Entrez un montant')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const row = new ActionRowBuilder().addComponents(input);
                        modal.addComponents(row);

                        await interaction.showModal(modal);

                        try {
                            const modalResponse = await interaction.awaitModalSubmit({ time: 60_000 });
                            const amount = modalResponse.fields.getTextInputValue('bank.withdraw_input');
                            const withdrawAmount = parseFloat(amount);

                            if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
                                await modalResponse.reply({ content: 'Montant invalide. Veuillez entrer un nombre positif.', ephemeral: true });
                                return;
                            }

                            await Bank.bankWithdrawAmount(interaction.user, withdrawAmount);
                            const new_profile = await Profiles.getProfile(interaction.user);
                            const bank_balance = await ImageGenerator.BankBalance(interaction, new_profile);

                            await modalResponse.reply({ content: `Vous avez retiré **${withdrawAmount}€** avec succès.`, ephemeral: true });
                            await interaction.editReply({
                                files: [bank_balance],
                                components: [
                                    new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                        .setCustomId('bank.deposit_all')
                                        .setLabel("Déposer tout")
                                        .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                        .setCustomId('bank.deposit')
                                        .setLabel("Déposer un montant")
                                        .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                        .setCustomId('bank.withdraw')
                                        .setLabel("Retirer un montant")
                                        .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                        .setCustomId('bank.withdraw_all')
                                        .setLabel("Retirer tout")
                                        .setStyle(ButtonStyle.Danger),
                                    ),
                                    new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                        .setCustomId('bank.selects')
                                        .setPlaceholder('Sélectionnez une option')
                                        .addOptions(
                                            new StringSelectMenuOptionBuilder()
                                            .setValue("bank.e_wallet")
                                            .setLabel("Portefeuille électronique")
                                            .setDescription("Consulter votre portefeuille électronique")
                                            .setEmoji("🪙"),
                                            new StringSelectMenuOptionBuilder()
                                            .setValue("bank.interests")
                                            .setLabel("Intérêts & Investissements")
                                            .setDescription("Consulter votre livret A et vos investissements")
                                            .setEmoji("📈"),
                                            new StringSelectMenuOptionBuilder()
                                            .setValue("bank.credit_card")
                                            .setLabel("Carte de Crédit")
                                            .setDescription("Consulter votre offre de carte de crédit")
                                            .setEmoji("💳"),
                                        )
                                    )
                                ]   
                            });
                        } catch (err) {
                            console.error('Erreur lors de la collecte de la réponse :', err);
                            await interaction.followUp({ content: 'Vous avez mis trop de temps à répondre. Veuillez réessayer.', ephemeral: true });
                        }
                        break;
                    }

                    case 'bank.withdraw_all': {
                        await interaction.deferUpdate();
                        await Bank.bankWithdrawAll(interaction.user);

                        const new_profile = await Profiles.getProfile(interaction.user);
                        const bank_balance = await ImageGenerator.BankBalance(interaction, new_profile);

                        await interaction.editReply({
                            files: [bank_balance],
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('bank.deposit_all')
                                            .setLabel("Déposer tout")
                                            .setStyle(ButtonStyle.Danger),
                                        new ButtonBuilder()
                                            .setCustomId('bank.deposit')
                                            .setLabel("Déposer un montant")
                                            .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                            .setCustomId('bank.withdraw')
                                            .setLabel("Retirer un montant")
                                            .setStyle(ButtonStyle.Primary),
                                        new ButtonBuilder()
                                            .setCustomId('bank.withdraw_all')
                                            .setLabel("Retirer tout")
                                            .setStyle(ButtonStyle.Danger),
                                    ),
                                new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('bank.selects')
                                            .setPlaceholder('Sélectionnez une option')
                                            .addOptions(
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.e_wallet")
                                                    .setLabel("Portefeuille électronique")
                                                    .setDescription("Consulter votre portefeuille électronique")
                                                    .setEmoji("🪙"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.interests")
                                                    .setLabel("Intérêts & Investissements")
                                                    .setDescription("Consulter votre livret A et vos investissements")
                                                    .setEmoji("📈"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.credit_card")
                                                    .setLabel("Carte de Crédit")
                                                    .setDescription("Consulter votre offre de carte de crédit")
                                                    .setEmoji("💳"),
                                            )
                                    )
                            ]
                        });
                        break;
                    }
                }
            }

            // Fonction pour gérer les interactions de sélection
            async function handleSelectInteraction(interaction) {
                switch (interaction.values[0]) {
                    case 'bank.manage_account': {
                        const new_profile = await Profiles.getProfile(interaction.user);
                        const bank_balance = await ImageGenerator.BankBalance(interaction, new_profile);

                        await interaction.update({
                            files: [bank_balance],
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('bank.deposit_all')
                                        .setLabel("Déposer tout")
                                        .setStyle(ButtonStyle.Danger),
                                    new ButtonBuilder()
                                        .setCustomId('bank.deposit')
                                        .setLabel("Déposer un montant")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId('bank.withdraw')
                                        .setLabel("Retirer un montant")
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId('bank.withdraw_all')
                                        .setLabel("Retirer tout")
                                        .setStyle(ButtonStyle.Danger),
                                ),
                                new ActionRowBuilder().addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('bank.selects')
                                        .setPlaceholder('Sélectionnez une option')
                                        .addOptions(
                                            new StringSelectMenuOptionBuilder()
                                                .setValue("bank.e_wallet")
                                                .setLabel("Portefeuille électronique")
                                                .setDescription("Consulter votre portefeuille électronique")
                                                .setEmoji("🪙"),
                                            new StringSelectMenuOptionBuilder()
                                                .setValue("bank.interests")
                                                .setLabel("Intérêts & Investissements")
                                                .setDescription("Consulter votre livret A et vos investissements")
                                                .setEmoji("📈"),
                                            new StringSelectMenuOptionBuilder()
                                                .setValue("bank.credit_card")
                                                .setLabel("Carte de Crédit")
                                                .setDescription("Consulter votre offre de carte de crédit")
                                                .setEmoji("💳"),
                                        )
                                )
                            ],
                        })
                        break;
                    }

                    case 'bank.e_wallet': {
                        const bank_wallet = await ImageGenerator.BankWallet(interaction, profile);

                        interaction.update({
                            files: [bank_wallet] ,
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('bank.selects')
                                            .setPlaceholder('Sélectionnez une option')
                                            .addOptions(
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.manage_account")
                                                    .setLabel("Gérer mon compte")
                                                    .setDescription("Déposer / Retirer de l'argent de votre compte en banque")
                                                    .setEmoji("🏦"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.interests")
                                                    .setLabel("Intérêts & Investissements")
                                                    .setDescription("Consulter votre livret A et vos investissements")
                                                    .setEmoji("📈"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.credit_card")
                                                    .setLabel("Carte de Crédit")
                                                    .setDescription("Consulter votre offre de carte de crédit")
                                                    .setEmoji("💳"),
                                            )
                                    )
                            ]
                        })
                        break;
                    }

                    case 'bank.interests': {
                        await interaction.reply({
                            content: 'Cette fonctionnalité est en cours de développement.',
                            ephemeral: true
                        })
                        break;
                    }

                    case 'bank.credit_card': {
                        const bank_card = await ImageGenerator.BankCard(interaction, profile);

                        await interaction.update({
                            files: [bank_card] ,
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('bank.selects')
                                            .setPlaceholder('Sélectionnez une option')
                                            .addOptions(
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.manage_account")
                                                    .setLabel("Gérer mon compte")
                                                    .setDescription("Déposer / Retirer de l'argent de votre compte en banque")
                                                    .setEmoji("🏦"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.e_wallet")
                                                    .setLabel("Portefeuille électronique")
                                                    .setDescription("Consulter votre portefeuille électronique")
                                                    .setEmoji("🪙"),
                                                new StringSelectMenuOptionBuilder()
                                                    .setValue("bank.interests")
                                                    .setLabel("Intérêts & Investissements")
                                                    .setDescription("Consulter votre livret A et vos investissements")
                                                    .setEmoji("📈"),
                                            )
                                    )
                            ]
                        });
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors de la génération de l\'image :', error);
            await interaction.reply({ content: 'Une erreur s\'est produite lors de la génération de l\'image.', ephemeral: true });
        }
    },
};