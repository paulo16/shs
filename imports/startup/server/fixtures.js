import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';

if (!Meteor.isProduction) {
    const users = [
        {
            username: 'polo',
            email: 'admin@admin.com',
            password: 'password',
            profile: {
                firstName: 'Paul',
                lastName: 'Mbilong',
                numero_agent: 199,
                phone: '0606575619'
            },
            roles: ['admin'],
        },
        {
            username: 'sbouyahia',
            email: 'sbouyahia@admin.com',
            password: 'sbouyahia',
            profile: {
                firstName: 'bouyahia',
                lastName: 'samira',
                numero_agent: 13,
                //phone: ''
            },
            roles: ['manager'],
        },
        {
            username: 'mzouine',
            email: 'mzouine@admin.com',
            password: 'mzouine',
            profile: {
                firstName: 'Meriam',
                lastName: 'Zouine',
                numero_agent: 14,
                //phone: ''
            },
            roles: ['manager'],
        },
        {
            username: 'ataouil',
            email: 'ataouil@admin.com',
            password: 'ataouil',
            profile: {
                firstName: 'abdellah',
                lastName: 'Taouil',
                numero_agent: 15,
                //phone: ''
            },
            roles: ['agent'],
        },
        {
            username: 'ibouhssine',
            email: 'ibouhssine@admin.com',
            password: 'ibouhssine',
            profile: {
                firstName: 'ismail',
                lastName: 'Bouhssine',
                numero_agent: 16,
                //phone: ''
            },
            roles: ['agent'],
        },
        {
            username: 'faittaleb',
            email: 'faittaleb@admin.com',
            password: 'faittaleb',
            profile: {
                firstName: 'fetah',
                lastName: 'Aittaleb',
                numero_agent: 17,
                //phone: ''
            },
            roles: ['agent'],
        },
        {
            username: 'sfedouaki',
            email: 'sfedouaki@admin.com',
            password: 'sfedouaki',
            profile: {
                firstName: 'samir',
                lastName: 'Fedouaki',
                numero_agent: 18,
                //phone: ''
            },
            roles: ['agent'],
        },
    ];

    users.forEach((user) => {
        let userExists = Meteor.users.findOne({ username: user.username });

        if (!userExists) {
            try {
                let userId = Accounts.createUser(user);
                if (userId) {
                    Roles.addUsersToRoles(userId, user.roles);
                    console.log('Utilisateur bien ajouté!');
                    // FlowRouter.go('/'); // Ceci est une redirection depuis un event/helper, elle est basée sur le nom de la route

                }
            }
            catch (err) {
                console.log('Problème lors de l \'insertion des fixtures---' + err);
            }
        }

    });
}
