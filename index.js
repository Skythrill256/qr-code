const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const csv = require("csv-parser");
const fsExtra = require("fs-extra");

const inputFile = "QR_Generation_New_Updated.csv";
const outputDir = path.join(__dirname, "images");

fsExtra.ensureDirSync(outputDir);

function generateQRCode(id, name, callback) {
	const constantPart = "v1;p;";
	const variablePart = `${id};${name}`;
	const text = `${constantPart}${variablePart}`;
	const sanitizedFilename = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
	const filename = path.join(outputDir, `${sanitizedFilename}.png`);

	QRCode.toFile(
		filename,
		text,
		{
			color: {
				dark: "#000000",
				light: "#FFFFFF",
			},
		},
		function (err) {
			if (err) return callback(err);
			callback(null, filename);
		},
	);
}

let count = 0;
const results = [];

fs.createReadStream(inputFile)
	.pipe(csv())
	.on("data", (data) => {
		if (count < 30) {
			results.push(data);
			count++;
		}
	})
	.on("end", () => {
		results.forEach((row) => {
			const id = row["ID"];
			const name = row["QR Code"];
			if (id && name) {
				console.log(`Generating QR code for ID: ${id}, Name: ${name}`);
				generateQRCode(id, name, (err, filename) => {
					if (err) {
						console.error(`Error generating QR code for ${name}:`, err);
					} else {
						console.log(`QR code saved to ${filename}`);
					}
				});
			} else {
				console.error("Invalid data row:", row);
			}
		});
	});
