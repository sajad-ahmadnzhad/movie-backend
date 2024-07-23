import { exec } from "child_process";

const migrationName = process.argv[2];

if (!migrationName) {
  console.error("Please provide a migration name.");
  process.exit(1);
}

const command = `npm run typeorm migration:create ./src/migrations/${migrationName}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    return console.error(`Error: ${error.message}`);
  }

  if (stderr) {
    return console.error(`Error: ${stderr}`);
  }

  console.log(`Stdout: ${stdout}`);
});
