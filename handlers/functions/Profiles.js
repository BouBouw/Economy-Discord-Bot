const { Colors } = require('discord.js');
const prisma = require('../database');

const createProfile = async (user, interaction) => {
    await prisma.profile.create({ data: { userId: user.id } });
    return interaction.reply({
        embeds: [{
            color: Colors.Green,
            description: `Votre profil vient d'être créer. Veuiillez réessayer la commande.`
        }]
    });
};

const getProfile = async (user) => {
    return prisma.profile.findFirst({ where: { userId: user.id } });
};

const doubleExperience = async (user, entry) => {
    const profile = await getProfile(user);
    const callbackInt = parseInt(entry);
    if (profile.boostDuration === null) return callbackInt;
    return (callbackInt * 2);
};

const Profiles = { createProfile, getProfile, doubleExperience };
module.exports = Profiles;
