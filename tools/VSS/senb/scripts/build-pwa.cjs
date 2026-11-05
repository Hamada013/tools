// VSS has one worker and one release for all activities.
require('../../scripts/build-pwa.cjs').build({check:process.argv.includes('--check')});
