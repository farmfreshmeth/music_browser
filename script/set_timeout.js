#!/opt/homebrew/bin/node

console.log(process.argv);
if (!process.argv.includes("--no-download")) { console.log("No --no-download"); }


// test setTimeout

const delay = async (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms))

console.log(performance.now());
const wtf = async function () {
  for (let i = 0; i < 10; i++) {
    console.log(`${performance.now()} ${i}`);
    await delay(1000);
  }
}

wtf();

console.log(performance.now());