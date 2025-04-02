const { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const { ImageBuffer } = require('../../../handlers/functions/Images/FrameGenerator');
const Banks = require('../../../handlers/functions/Images/Commands/Bank');
const Profiles = require('../../../handlers/functions/Profiles');
const Bank = require('../../../handlers/functions/Economy/Bank');

module.exports = {
    name: 'bank',
    description: '(🪙) Economy',
    type: ApplicationCommandType.ChatInput,
execute: async (client, interaction, args, con) => {
    let settings = {
        type: 'bank_account'
    }

    const profile = await Profiles.getProfile(interaction.user);

    let { canvas } = await Banks(interaction, settings.type);
    const img = await ImageBuffer(canvas);

    async function generateComponents(type) {
        let profile = await Profiles.getProfile(interaction.user);

        if(type === 'bank_account') {
            const btn_1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('bank.deposit_all')
                .setLabel(`Déposer tous (${profile.balance})`)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(profile.balance <= 0 ? true : false),
                new ButtonBuilder()
                .setCustomId('bank.deposit_amount')
                .setLabel(`Déposer un montant`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(profile.balance <= 0 ? true : false),
            )
    
            const btn_2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('bank.withdraw_all')
                .setLabel(`Retirer tous (${profile.in_bank})`)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(profile.in_bank <= 0 ? true : false),
                new ButtonBuilder()
                .setCustomId('bank.withraw_amount')
                .setLabel(`Retirer un montant`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(profile.in_bank <= 0 ? true : false),
            )
    
            const select = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('bank.selects')
                .setPlaceholder("Faîtes une action :")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.manage_account")
                    .setLabel("Gérer mon compte")
                    .setDefault(type === 'bank_account' ? true : false),
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.e_wallet")
                    .setLabel("Portefeuille électronique")
                    .setDefault(type === 'e_wallet' ? true : false),
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.interests")
                    .setLabel("Intérêts & Investissements")
                    .setDefault(type === 'interests' ? true : false),
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.credit_card")
                    .setLabel("Carte de crédit")
                    .setDefault(type === 'credit_card' ? true : false),
                )
            )
    
            return [btn_1, btn_2, select];
        } else {
            const select = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('bank.selects')
                .setPlaceholder("Faîtes une action :")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.manage_account")
                    .setLabel("Gérer mon compte")
                    .setDefault(type === 'bank_account' ? true : false),
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.e_wallet")
                    .setLabel("Portefeuille électronique")
                    .setDefault(type === 'e_wallet' ? true : false),
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.interests")
                    .setLabel("Intérêts & Investissements")
                    .setDefault(type === 'interests' ? true : false),
                    new StringSelectMenuOptionBuilder()
                    .setValue("bank.select.credit_card")
                    .setLabel("Carte de crédit")
                    .setDefault(type === 'credit_card' ? true : false),
                )
            )
    
            return [select];
        }
    }

    interaction.reply({
        files: [ img ],
        components: await generateComponents(settings.type)
    }).then(async (msg) => {
        const buttonFilter = (i) => i.user.id === interaction.user.id && i.isButton();
        const selectFilter = (i) => i.user.id === interaction.user.id && i.isStringSelectMenu();

        const collector = msg.createMessageComponentCollector({
            filter: (i) => buttonFilter(i) || selectFilter(i),
            time: 600000,
        });

        collector.on('collect', async (i) => {
            if (i.isButton()) {
                await handleButtonInteraction(i);
            } else if (i.isStringSelectMenu()) {
                await handleSelectInteraction(i);
            }
        });

        collector.on('end', () => {
            interaction.editReply({ components: [] });
        });

        async function handleButtonInteraction(interaction) {
            switch(interaction.customId) {
                case 'bank.deposit_all': {
                    await interaction.deferUpdate();
                    await Bank.bankDepositAll(interaction.user);

                    const { canvas } = await Banks(interaction, settings.type);
                    const img = await ImageBuffer(canvas);

                    await interaction.editReply({
                        files: [ img ],
                        components: await generateComponents(settings.type)
                    })

                    break;
                }

                case 'bank.deposit_amount': {
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
                            await modalResponse.reply({ content: 'Montant invalide. Veuillez entrer un nombre positif.', flags: "Ephemeral" });
                            return;
                        }
                        await Bank.bankDepositAmount(interaction.user, depositAmount);

                        const { canvas } = await Banks(interaction, settings.type);
                        const img = await ImageBuffer(canvas);

                        await interaction.editReply({
                            files: [ img ],
                            components: await generateComponents(settings.type)
                        })
                        await modalResponse.reply({ content: `Vous avez déposé **${depositAmount}€** avec succès.`, flags: "Ephemeral" });
                    } catch(err) {
                        console.error(err);
                    }
                    break;
                }

                case 'bank.withdraw_all': {
                    await interaction.deferUpdate();
                    await Bank.bankWithdrawAll(interaction.user);

                    const { canvas } = await Banks(interaction, settings.type);
                    const img = await ImageBuffer(canvas);

                    await interaction.editReply({
                        files: [ img ],
                        components: await generateComponents(settings.type)
                    })
                    break;
                }

                case 'bank.withraw_amount': {
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
                            await modalResponse.reply({ content: 'Montant invalide. Veuillez entrer un nombre positif.', flags: "Ephemeral" });
                            return;
                        }
                        await Bank.bankWithdrawAmount(interaction.user, withdrawAmount);

                        const { canvas } = await Banks(interaction, settings.type);
                        const img = await ImageBuffer(canvas);
    
                        await interaction.editReply({
                            files: [ img ],
                            components: await generateComponents(settings.type)
                        });
                        await modalResponse.reply({ content: `Vous avez retiré **${withdrawAmount}€** avec succès.`, flags: "Ephemeral" });
                    } catch(err) {
                        console.error(err);
                    }
                    break;
                }
            }
        }

        async function handleSelectInteraction(interaction) {
            switch (interaction.values[0]) {
                case 'bank.select.manage_account': {
                    settings.type = "bank_account";

                    const { canvas } = await Banks(interaction, settings.type);
                    const img = await ImageBuffer(canvas);

                    await interaction.update({
                        files: [ img ],
                        components: await generateComponents(settings.type)
                    });
                    break;
                }

                case 'bank.select.e_wallet': {
                    settings.type = "e_wallet";

                    const { canvas } = await Banks(interaction, settings.type);
                    const img = await ImageBuffer(canvas);

                    await interaction.update({
                        files: [ img ],
                        components: await generateComponents(settings.type)
                    });
                    break;
                }

                case 'bank.select.credit_card': {
                    settings.type = "credit_card";

                    const { canvas } = await Banks(interaction, settings.type);
                    const img = await ImageBuffer(canvas);

                    await interaction.update({
                        files: [ img ],
                        components: await generateComponents(settings.type)
                    });
                    break;
                }
            }
        }
    });

    }
}