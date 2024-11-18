const dotenv = require("dotenv");
const fs = require("fs");

// Load environment variables from the .env file
dotenv.config();

// Define the target path for environment.ts
const targetPath = "./src/environments/environment.ts";

// Create the environment file content dynamically based on .env variables
const envConfigFile = `export const environment = {
production: false,
  baseUrl: "${process.env.BASE_URL}",
  schemaUrl: 'assets/config/schema.json', 
  client_id: "${process.env.CLIENT_ID}",
  api_key:"${process.env.API_KEY}",
  certificate_template_id: "${process.env.CERTIFICATE_TEMPLATE_ID}",
  result_template_id: "${process.env.RESULT_TEMPLATE_ID}",
  discovery_docs:${process.env.DISCOVERY_DOCS},
  scopes:"${process.env.SCOPES}",
  
  logo: 'assets/images/logo.png',
keycloakConfig: {
    url: 'https://ndear.xiv.in/auth',
    realm: 'sunbird-rc',
     clientId: 'registry-frontend'
  }
  };`;

// Write the content to environment.ts
fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Output generated at ${targetPath}`);
  }
});
