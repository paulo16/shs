import 'meteor/cfs:standard-packages';
import 'meteor/cfs:filesystem';

//FS.debug = true;

let fs = Npm.require('fs');
let rootpath = fs.realpathSync('.');
//console.log('root-path -' + rootpath);
let meteor_root = Npm.require('fs').realpathSync(process.cwd() + '/../../');
let application_root = Npm.require('fs').realpathSync(meteor_root + '/../../../../');
//console.log('root-path2 -' + application_root);

let pdfStore = new FS.Store.FileSystem('pdfstore', {
    transformWrite: function (fileObj, readStream, writeStream) {
        readStream.pipe(writeStream);
    }
    ,
    beforeWrite: function (fileObj) {
        return {
            extension: 'pdf',
            type: 'application/pdf'
        };
    },
    path: application_root + '/pdfshs',
});

export const Pdfs = new FS.Collection('pdfs', {
    stores: [pdfStore]
});

Pdfs.allow({
    insert: function () {
        return true;
    },
    update: function () {
        return true;
    },
    remove: function () {
        return true;
    },
    download: function () {
        return true;
    }
});