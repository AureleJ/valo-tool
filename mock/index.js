import fs from 'fs';
import path from 'path';

export default [
    {
        url: '/api/updateMap',
        method: 'post',
        response: (req) => {
            const {map, difficulty, filename, coordinates} = req.body;
            const filePath = path.resolve(`./maps/${map}/${difficulty}.json`);

            try {
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, {recursive: true});
                }

                let data = {difficulty, callouts: []};
                if (fs.existsSync(filePath)) {
                    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                }

                if (!data.callouts) {
                    data.callouts = [];
                }

                data.callouts.push({
                    imageName: filename,
                    location: coordinates
                });

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

                console.log(`Données mises à jour: ${filePath}`);
                return {code: 200, data: {success: true}};
            } catch (error) {
                console.error("Erreur:", error);
                return {code: 500, data: {error: error.message}};
            }
        },
    },
];