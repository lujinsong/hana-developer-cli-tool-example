const colors = require("colors/safe");
const bundle = global.__bundle;

exports.command = 'createModule';
exports.aliases = ['createDB', 'createDBModule'];
exports.describe = bundle.getText("createModule");


exports.builder = {
    folder: {
        alias: ['f', 'Folder'],
        type: 'string',
        default: 'db',
        desc: bundle.getText("folder")
    }
};

exports.handler = function (argv) {
    const prompt = require('prompt');
    prompt.override = argv;
    prompt.message = colors.green(bundle.getText("input"));
    prompt.start();

    var schema = {
        properties: {
            folder: {
                description: bundle.getText("folder"),
                type: 'string',
                required: true
            }
        }
    };

    prompt.get(schema, (err, result) => {
        if (err) {
            return console.log(err.message);
        }
        global.startSpinner()
        dbStatus(result);
    });
}


async function dbStatus(result) {
    let fs = require('fs');
    let dir = './' + result.folder;

    !fs.existsSync(dir) && fs.mkdirSync(dir);

    let build = `
// Executes the CDS build depending on whether we have a top-level package.json.
// Package.json is not available when we are called by CF/XSA buildpack.  In this case we don't do anything
// and just assume our model was already built and is available as part of this DB app.
//
// This is a workaround that will be replaced by a solution where CDS generates the DB module along with package.json.

const fs = require('fs');
const childproc = require('child_process');

if (fs.existsSync('../package.json')) {
    // true at build-time, false at CF staging time
    childproc.execSync('npm install && npm run build', {
        cwd: '..',
        stdio: 'inherit'
    });
}
    `
    fs.writeFile(dir + '/.build.js', build, (err) => {
        if (err) throw err;
    });

    let packageContent = `
    {
        "name": "deploy",
        "dependencies": {
          "@sap/hdi-deploy": "^3.11.0"
        },
        "engines": {
          "node": "^10"
        },
        "scripts": {
          "postinstall": "node .build.js",
          "start": "node node_modules/@sap/hdi-deploy/deploy.js  --auto-undeploy"
        }
      }   
    `
    fs.writeFile(dir + '/package.json', packageContent, (err) => {
        if (err) throw err;
    });

    !fs.existsSync(dir + '/src') && fs.mkdirSync(dir+ '/src');
    let hdiconfig = `
    {
        "file_suffixes": {
         "hdbcollection": {
          "plugin_name": "com.sap.hana.di.collection"
         },
         "hdbsystemversioning": {
          "plugin_name": "com.sap.hana.di.systemversioning"
         },
         "hdbsynonym": {
          "plugin_name": "com.sap.hana.di.synonym"
         },
         "hdbsynonymconfig": {
          "plugin_name": "com.sap.hana.di.synonym.config"
         },
         "hdbtable": {
          "plugin_name": "com.sap.hana.di.table"
         },
         "hdbdropcreatetable": {
          "plugin_name": "com.sap.hana.di.dropcreatetable"
         },
         "hdbvirtualtable": {
          "plugin_name": "com.sap.hana.di.virtualtable"
         },
         "hdbvirtualtableconfig": {
          "plugin_name": "com.sap.hana.di.virtualtable.config"
         },
         "hdbindex": {
          "plugin_name": "com.sap.hana.di.index"
         },
         "hdbfulltextindex": {
          "plugin_name": "com.sap.hana.di.fulltextindex"
         },
         "hdbconstraint": {
          "plugin_name": "com.sap.hana.di.constraint"
         },
         "hdbtrigger": {
          "plugin_name": "com.sap.hana.di.trigger"
         },
         "hdbstatistics": {
          "plugin_name": "com.sap.hana.di.statistics"
         },
         "hdbview": {
          "plugin_name": "com.sap.hana.di.view"
         },
         "hdbcalculationview": {
          "plugin_name": "com.sap.hana.di.calculationview"
         },
         "hdbprojectionview": {
          "plugin_name": "com.sap.hana.di.projectionview"
         },
         "hdbprojectionviewconfig": {
          "plugin_name": "com.sap.hana.di.projectionview.config"
         },
         "hdbresultcache": {
          "plugin_name": "com.sap.hana.di.resultcache"
         },
         "hdbcds": {
          "plugin_name": "com.sap.hana.di.cds"
         },
         "hdbfunction": {
          "plugin_name": "com.sap.hana.di.function"
         },
         "hdbvirtualfunction": {
          "plugin_name": "com.sap.hana.di.virtualfunction"
         },
         "hdbvirtualfunctionconfig": {
          "plugin_name": "com.sap.hana.di.virtualfunction.config"
         },
         "hdbhadoopmrjob": {
          "plugin_name": "com.sap.hana.di.virtualfunctionpackage.hadoop"
         },
         "jar": {
          "plugin_name": "com.sap.hana.di.virtualfunctionpackage.hadoop"
         },
         "hdbtabletype": {
          "plugin_name": "com.sap.hana.di.tabletype"
         },
         "hdbprocedure": {
          "plugin_name": "com.sap.hana.di.procedure"
         },
         "hdbvirtualprocedure": {
          "plugin_name": "com.sap.hana.di.virtualprocedure"
         },
         "hdbvirtualprocedureconfig": {
          "plugin_name": "com.sap.hana.di.virtualprocedure.config"
         },
         "hdbafllangprocedure": {
          "plugin_name": "com.sap.hana.di.afllangprocedure"
         },
         "hdblibrary": {
          "plugin_name": "com.sap.hana.di.library"
         },
         "hdbsequence": {
          "plugin_name": "com.sap.hana.di.sequence"
         },
         "hdbrole": {
          "plugin_name": "com.sap.hana.di.role"
         },
         "hdbroleconfig": {
          "plugin_name": "com.sap.hana.di.role.config"
         },
         "hdbstructuredprivilege": {
          "plugin_name": "com.sap.hana.di.structuredprivilege"
         },
         "hdbanalyticprivilege": {
          "plugin_name": "com.sap.hana.di.analyticprivilege"
         },
         "hdbtabledata": {
          "plugin_name": "com.sap.hana.di.tabledata"
         },
         "csv": {
          "plugin_name": "com.sap.hana.di.tabledata.source"
         },
         "properties": {
          "plugin_name": "com.sap.hana.di.tabledata.properties"
         },
         "tags": {
          "plugin_name": "com.sap.hana.di.tabledata.properties"
         },
         "hdbgraphworkspace": {
          "plugin_name": "com.sap.hana.di.graphworkspace"
         },
         "hdbflowgraph": {
          "plugin_name": "com.sap.hana.di.flowgraph"
         },
         "hdbreptask": {
          "plugin_name": "com.sap.hana.di.reptask"
         },
         "hdbsearchruleset": {
          "plugin_name": "com.sap.hana.di.searchruleset"
         },
         "hdbtextconfig": {
          "plugin_name": "com.sap.hana.di.textconfig"
         },
         "hdbtextdict": {
          "plugin_name": "com.sap.hana.di.textdictionary"
         },
         "hdbtextrule": {
          "plugin_name": "com.sap.hana.di.textrule"
         },
         "hdbtextinclude": {
          "plugin_name": "com.sap.hana.di.textrule.include"
         },
         "hdbtextlexicon": {
          "plugin_name": "com.sap.hana.di.textrule.lexicon"
         },
         "hdbtextminingconfig": {
          "plugin_name": "com.sap.hana.di.textminingconfig"
         },
         "txt": {
          "plugin_name": "com.sap.hana.di.copyonly"
         }
        }
       }   
    `
    fs.writeFile(dir + '/src/.hdiconfig', hdiconfig, (err) => {
        if (err) throw err;
    });

    global.__spinner.stop()
    return;
}