import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import { Pdfs } from './pdfs.js';

Meteor.methods({
    urlpdf: function (name) {
        let pdf = Pdfs.find({ name: name });
        return pdf;
    },
});