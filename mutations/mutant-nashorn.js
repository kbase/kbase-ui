/*
 * MUTANT
 * Not a build system, a mutation machine.
 * 
 */

/*
 * Here is the idea of mutant. It decomposes the build process into a map of mutation
 * machines. The initial raw material + inputs enters the first process, which
 * works on it, then passes it to a second, and so forth.
 * 
 * The main ideas are:
 * - the system travels between processes, does not exist anywhere else.
 * - each process may mutate the system, and must pass those mutations to 
 *   the next process.
 * - processes are just javascript, so may include conditional branching, etc.
 * - procsses are asynchronous by nature, promises, so may arbitrarily contain 
 *   async tasks, as long as they adhere to the promises api.
 *   
 */

/*global define*/
/*jslint white:true*/
'use strict';

var uniqState = 1;
function uniq(prefix) {
    uniqState += 1;
    return prefix + String(uniqState);
}

function mkdir(dir) {
    var path = ['mutantfiles', dir].join('/'),
        file = new java.io.File(path);
    if (file.exists()) {
        throw new Error('Sorry, this dir already exists: ' + path);
    }
    file.mkdir();    
    return dir;
}

function copydir(fromDir, toDir) {
    var fromPath = java.nio.file.Paths.get('mutantfiles', fromDir),
        toPath = java.nio.file.Paths.get('mutantfiles', toDir),
        copyOption = java.nio.file.StandardCopyOption;
    java.nio.file.Files.copy(fromPath, toPath, copyOption.COPY_ATTRIBUTES);    
}
    
// ENGINE
// The little one that could.
function engine(app, state, next) {
    var nextProcess = app[next].process,
        result,
        newState = JSON.parse(JSON.stringify(state)),
        tempDir = uniq('temp_');
    
    if (nextProcess) {
        try {            
            // make our filesystem.
            var fs = mkdir(tempDir),
                oldfs = state.filesystem;
                
            state.filesystem = [fs];
            
            oldfs.forEach(function (path) {
                copydir(path, fs);
            });
            
            // synchronous!
            result = nextProcess(newState);
            // console.log(result);
            if (result[1]) {
                return engine(app, result[0], result[1]);
            } else {
                return result[0];
            }
        } catch (ex) {
            print('ERROR in the process: ' + next);
            print(ex);
            print(ex.printStackTrace());
        }
    }
}

// PROCESSES
function proc1(state) {
    state.system.age = state.system.age += 1;
    return [state, 'proc2'];
}
function proc2(state) {
    state.environment.greeting = 'Hi1';
    return [state, 'proc3'];
}
function proc3(state) {
    if (state.system.age > 52) {
        return [state, 'proc4'];
    } else {
        return [state, 'proc5'];
    }
}
function proc4(state) {
    state.environment.old = true;
    return [state];
}
function proc5(state) {
    state.environment.old = false;
    return [state];
}
var processes = {
    proc1: {
        process: proc1
    },
    proc2: {
        process: proc2
    },
    proc3: {
        process: proc3
    },
    proc4: {
        process: proc4
    },
    proc5: {
        process: proc5
    }
}

// STATE
// initial state
var state = {
    filesystem: ["state0"],
    environment: {
    },
    system: {
        name: "Erik",
        age: 51
    },
    state: {
    }
};


// INVOCATION
var result = engine(processes, state, 'proc1');
print(JSON.stringify(result));

