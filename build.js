const fs = require("fs");

const prodCode = 
    `
        const SERVER_URL = "";
        export { SERVER_URL };
    `;

const devCode = 
    `
        const SERVER_URL = "http://localhost:5000";
        export { SERVER_URL };
    `;

let code = process.argv[2] === "prod" ? prodCode : devCode;
fs.writeFileSync("client/src/constants.ts", code);