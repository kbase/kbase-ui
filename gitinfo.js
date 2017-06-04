var Promise = require('bluebird');
var exec = require('child_process').exec;

function gitinfo() {
    function run(command) {
        return new Promise(function (resolve, reject) {
            exec(command, {}, function (err, stdout, stderr) {
                if (err) {
                    reject(Error);
                }
                if (stderr) {
                    reject(new Error(stderr));
                }
                resolve(stdout);
            });
        });
    }

    return Promise.all([
            run('git show --format=%H%n%h%n%an%n%ai%n%cn%n%ci%n%d'),
            run('git show --format=%s'),
            run('git show --format=%N')
        ])
        .spread(function (infoString, subject, notes) {
            var info = infoString.split('\n');
            return {
                commitHash: info[0],
                commitAbbreviatedHash: info[1],
                authorName: info[2],
                authorDate: info[3],
                committerName: info[4],
                committerDate: info[5],
                reflogSelector: info[6],
                subject: subject,
                commitNotes: notes
            };
        });
}


gitinfo().then(function (info) { console.log(info); });
