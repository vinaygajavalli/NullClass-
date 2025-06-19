const { exec } = require('child_process');

const tests = [
    'test_login.js',
    'test_login_edge.js',
    'test_login_mobile.js',
    'test_payment_success.js',
    'test_audio_upload.js',
    'test_otp.js'
];

const runTest = (test) => {
    return new Promise((resolve, reject) => {
        console.log(`Running ${test}...`);
        const process = exec(`node ${test}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running ${test}:`, error);
                reject(error);
                return;
            }
            console.log(`Output of ${test}:\n`, stdout);
            if (stderr) {
                console.error(`Error output of ${test}:\n`, stderr);
            }
            resolve();
        });
    });
};

const runAllTests = async () => {
    for (const test of tests) {
        try {
            await runTest(test);
        } catch (error) {
            console.error(`Test ${test} failed.`);
        }
    }
    console.log('All tests completed.');
};

runAllTests();
