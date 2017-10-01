$.validator.addMethod('emailUnique', (email) => {
    let exists = Meteor.users.findOne({ 'emails.0.address': email }, { fields: { 'emails.0.address': 1 } });
    return exists ? false : true;
});