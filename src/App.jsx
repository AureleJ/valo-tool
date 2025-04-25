import InteractiveMap from "./InteractiveMap.jsx";
import {useEffect, useState} from "react";

const RadioInput = ({id, name, label, value, defaultChecked, type, onChange}) => (
    <div
        className="flex items-center gap-x-3 w-auto px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
        <input
            id={id}
            name={name}
            type={type}
            defaultChecked={defaultChecked}
            value={value}
            onChange={() => {
                if (onChange) {
                    onChange(value);
                }
            }}
            className="relative size-4 appearance-none rounded-full border bg-white checked:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:bg-emerald-500 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
        />
        <label htmlFor={id} className="block text-sm font-medium text-white cursor-pointer">
            {label}
        </label>
    </div>
);

const DifficultySelector = ({title, availableDifficulties}) => {
    return (
        <fieldset className="mb-8 w-full">
            <legend className="text-white text-lg font-semibold mb-3">{title}</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {availableDifficulties.map((difficulty, index) => (
                    <RadioInput
                        key={index}
                        id={`difficulty-${index}`}
                        name="difficulty"
                        label={difficulty}
                        value={difficulty}
                        type="radio"
                        defaultChecked={index === 0}
                    />
                ))}
            </div>
        </fieldset>
    );
};

const MapSelector = ({title, availableMaps, onMapChange}) => {

    return (
        <fieldset className="mb-8 w-full">
            <legend className="text-white text-lg font-semibold mb-3">{title}</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {availableMaps.map((map, index) => (
                    <RadioInput
                        key={index}
                        id={`map-${index}`}
                        name="maps"
                        label={map}
                        value={map}
                        type="radio"
                        defaultChecked={index === 0}
                        onChange={() => onMapChange(map)}
                    />
                ))}
            </div>
        </fieldset>
    );
};

function App() {
    const [imageCoord, setImageCoord] = useState({x: 0, y: 0});
    const [status, setStatus] = useState("");
    const [selectedMap, setSelectedMap] = useState("pearl");
    const [imgPath, setImgPath] = useState("./maps/pearl/pearl.png");
    const [isLoading, setIsLoading] = useState(false);
    const [filename, setFilename] = useState("");

    useEffect(() => {
        setImgPath(selectedMap + ".png");
    }, [selectedMap]);

    const handleMapChange = (map) => {
        setSelectedMap(map);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const name = filename.trim();

        if (!name) {
            setStatus("Veuillez entrer un nom de fichier");
            return;
        }

        const filenameWithExt = name + ".png";

        const difficultyElement = document.querySelector('input[name="difficulty"]:checked');
        const selectedDifficulty = difficultyElement ? difficultyElement.value : "easy";

        setIsLoading(true);
        setStatus(`Ajout de la position pour ${selectedMap}/${selectedDifficulty}...`);

        updateMapData(selectedMap, selectedDifficulty, filenameWithExt, imageCoord)
            .then(() => {
                setFilename("");
                setStatus(`Position ajoutée au fichier ${selectedDifficulty}.json avec succès`);
                setIsLoading(false);
            })
            .catch(error => {
                setStatus(`Erreur: ${error.message}`);
                setIsLoading(false);
            });
    };

    const updateMapData = (map, difficulty, filename, coordinates) => {
        return fetch(`/api/updateMap`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                map,
                difficulty,
                filename,
                coordinates
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur lors de l'ajout des données pour ${map}/${difficulty}`);
                }
                return response.json();
            });
    };

    return (
        <div
            className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-900 w-full px-20">
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl flex flex-col items-center justify-center">
                    <InteractiveMap
                        imagePath={imgPath}
                        setImageCoord={setImageCoord}
                    />
                    <div className="mt-3 text-white bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                        <span className="font-mono">x={imageCoord.x.toFixed(4)}, y={imageCoord.y.toFixed(4)}</span>
                    </div>
                </div>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="w-full flex flex-col items-start justify-start p-6 bg-gray-800 rounded-lg shadow-lg max-w-lg"
                >
                    <MapSelector
                        availableMaps={["pearl", "fracture", "ascent", "breeze", "haven", "split", "icebox", "lotus", "bind", "sunset", "abyss"]}
                        title="Choisissez la carte"
                        onMapChange={handleMapChange}
                    />

                    <DifficultySelector
                        availableDifficulties={["easy", "medium", "hard", "spells"]}
                        title="Choisissez la difficulté"
                    />

                    <div className="w-full mb-6">
                        <label htmlFor="filename" className="block text-white text-lg font-semibold mb-3">
                            Nom du fichier
                        </label>
                        <input
                            id="filename"
                            className="rounded-md p-3 w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-emerald-500 focus:outline-none"
                            type="text"
                            placeholder="Nom du fichier sans l'extension"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className={`bg-emerald-600 hover:bg-emerald-500 text-white rounded-md p-3 text-lg font-medium w-full flex items-center justify-center transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Traitement en cours...
                            </>
                        ) : (
                            'Enregistrer la position'
                        )}
                    </button>
                </form>

                {status && (
                    <div
                        className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg transition-all duration-300 transform max-w-md ${
                            status.includes('Erreur')
                                ? 'bg-red-600 text-white border-l-4 border-red-800'
                                : 'bg-emerald-600 text-white border-l-4 border-emerald-800'
                        } animate-notification z-50`}
                    >
                        <div className="flex items-center">
                            <div className="shrink-0">
                                {status.includes('Erreur') ? (
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                              clipRule="evenodd"/>
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              clipRule="evenodd"/>
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{status}</p>
                            </div>
                        </div>
                        <div className="mt-2 w-full bg-white/30 rounded-full h-1">
                            <div className="bg-white h-1 rounded-full animate-shrink"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;