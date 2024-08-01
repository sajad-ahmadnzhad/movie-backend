import { exec } from "child_process";

const migrationName = process.argv[2];

if (!migrationName) {
  console.log("Please provide a migration name.");
  process.exit(1);
}

const command = `npx yarn typeorm migration:generate ./src/migrations/${migrationName} -d ./src/config/typeorm.ts`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }

  console.log(`Stdout: ${stdout}`);
});
