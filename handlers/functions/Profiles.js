const { Colors } = require("discord.js");
const { connection } = require("../..");

const createProfile = (user, interaction) => {
    connection.query(`INSERT INTO profiles (user_id) VALUES ('${user.id}')`, function(err, result) {
        if(err) throw err;

        return interaction.reply({
            embeds: [{
                color: Colors.Green,
                description: `Votre profil vient d'être créer. Veuiillez réessayer la commande.`
            }]
        })
    })
};

const getProfile = async (user) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query(`SELECT * FROM profiles WHERE user_id = '${user.id}'`, function(err, result) {
                if(err) throw err;
                resolve(result[0]);
            })
        } catch(err) {
            reject(err);
        }
    })
}

const doubleExperience = async (user, entry) => {
    const profile = await getProfile(user);
    const callbackInt = parseInt(entry);

    if(profile.boost_duration === null) return callbackInt;

    return (callbackInt * 2);
}

const Profiles = {
    createProfile,
    getProfile,
    doubleExperience
}

module.exports = Profiles;