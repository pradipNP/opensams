const bcrypt = require('bcryptjs');

const PLAINTEXT = 'password';
const SALT_ROUNDS = 10;

async function main() {
  const hash = await bcrypt.hash(PLAINTEXT, SALT_ROUNDS);
  const matches = await bcrypt.compare(PLAINTEXT, hash);

  console.log('plaintext:', PLAINTEXT);
  console.log('saltRounds:', SALT_ROUNDS);
  console.log('hash:', hash);
  console.log('verify:', matches);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
