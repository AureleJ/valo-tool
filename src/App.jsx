import InteractiveMap from "./InteractiveMap.jsx";
import {useEffect, useState} from "react";

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
    faCircleCheck,
    faCircleExclamation,
    faCircleInfo,
    faCircleMinus,
    faCirclePlus,
    faCircleXmark,
    faCopy,
    faDownload,
    faRecycle,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faDownload,
    faCopy,
    faCircleCheck,
    faCircleXmark,
    faCircleInfo,
    faCircleExclamation,
    faCirclePlus,
    faCircleMinus,
    faRecycle,
    faTrash
);

const RadioInput = ({id, name, label, value, checked, type, onChange, isAuthorizedToChange}) => (
    <div className="w-full">
        <label
            htmlFor={id}
            className={`flex items-center justify-center px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                checked
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-md'
                    : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
            }`}
        >
            <input
                id={id}
                name={name}
                type={type}
                checked={checked}
                value={value}
                onChange={() => {
                    if (!isAuthorizedToChange && onChange) {
                        onChange(value);
                    } else
                    {
                        window.alert("Veuillez réinitialiser le JSON avant de changer de carte ou de difficulté!");
                    }
                }}
                className="absolute opacity-0 w-0 h-0"
                // disabled={isAuthorizedToChange}
            />
            <span className="text-sm font-medium">{label}</span>
        </label>
    </div>
);

const DifficultySelector = ({title, availableDifficulties, initialDifficulty, onDifficultyChange, isAuthorizedToChange}) => {
    const [selected, setSelected] = useState(initialDifficulty || availableDifficulties[0]);

    useEffect(() => {
        if (initialDifficulty) {
            setSelected(initialDifficulty);
        }
    }, [initialDifficulty]);

    const handleSelection = (difficulty) => {
        setSelected(difficulty);
        onDifficultyChange(difficulty);
    };

    return (
        <fieldset className="mb-8 w-full">
            <legend className="text-white text-lg font-semibold mb-3">{title}</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {availableDifficulties.map((difficulty, index) => (
                    <RadioInput
                        isAuthorizedToChange={isAuthorizedToChange}
                        key={index}
                        id={`difficulty-${index}`}
                        name="difficulty"
                        label={difficulty}
                        value={difficulty}
                        type="radio"
                        checked={difficulty === selected}
                        onChange={() => handleSelection(difficulty)}
                    />
                ))}
            </div>
        </fieldset>
    );
};

const MapSelector = ({title, availableMaps, initialMap, onMapChange, isAuthorizedToChange}) => {
    const [selected, setSelected] = useState(initialMap || availableMaps[0]);

    useEffect(() => {
        if (initialMap) {
            setSelected(initialMap);
        }
    }, [initialMap]);

    const handleSelection = (map) => {
        setSelected(map);
        onMapChange(map);
    };

    return (
        <fieldset className="mb-8 w-full">
            <legend className="text-white text-lg font-semibold mb-3">{title}</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 overflow-y-auto pr-2 custom-scrollbar">
                {availableMaps.map((map, index) => (
                    <RadioInput
                        isAuthorizedToChange={isAuthorizedToChange}
                        key={index}
                        id={`map-${index}`}
                        name="maps"
                        label={map}
                        value={map}
                        type="radio"
                        checked={map === selected}
                        onChange={() => handleSelection(map)}
                    />
                ))}
            </div>
        </fieldset>
    );
};

function JsonGenerator({jsonData, mapName, difficulty, onReset, onRemoveCallout}) {
    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${difficulty}-${mapName}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (onReset) {
            onReset();
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
            alert('JSON copié dans le presse-papier!');
        } catch (err) {
            console.error('Erreur lors de la copie', err);
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-between">
            {/*<textarea
                className="w-full h-full bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-emerald-500 focus:outline-none resize-none"
                placeholder="JSON généré ici..."
                rows={20}
                cols={50}
                value={JSON.stringify(jsonData, null, 2)}
                readOnly
            />*/}

            <div
                className="w-full h-full p-4 bg-gray-800 rounded-lg p-2 text-gray-300">
                <h1 className="text-white font-semibold mb-2 px-2">{`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - ${mapName.charAt(0).toUpperCase() + mapName.slice(1)}`}</h1>

                <CalloutList
                    callouts={jsonData.callouts}
                    onRemoveCallout={onRemoveCallout}
                />
            </div>

            <div className="flex gap-4 mt-4 w-full">
                <button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-500 text-white rounded-md p-3 text-sm font-medium w-full flex items-center justify-center transition duration-300 ease-in-out">
                    <FontAwesomeIcon icon="fa-solid fa-recycle" className="mr-2"/>
                    Réinitialiser
                </button>

                <button
                    onClick={handleCopy}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-md p-3 text-sm font-medium w-full flex items-center justify-center transition duration-300 ease-in-out">
                    <FontAwesomeIcon icon="fa-solid fa-copy" className="mr-2"/>
                    Copier
                </button>

                <button
                    onClick={handleDownload}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-md p-3 text-sm font-medium w-full flex items-center justify-center transition duration-300 ease-in-out">
                    <FontAwesomeIcon icon="fa-solid fa-download" className="mr-2"/>
                    Télécharger
                </button>
            </div>
        </div>
    );
}

const CalloutList = ({callouts, onRemoveCallout}) => {
    if (callouts.length === 0) {
        return (
            <div className="w-full h-full p-4 text-gray-300 flex items-center justify-center">
                Aucun callout ajouté
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar">
            {/*<h3 className="text-white font-semibold mb-2 px-2">Callouts ({callouts.length})</h3>*/}
            <ul className="space-y-2">
                {callouts.map((callout, index) => (
                    <li key={index}
                        className="flex justify-between items-center p-2 rounded bg-gray-700 border-gray-600 border-2 text-gray-200">

                        <div className="text-white text-sm">
                            <span className="font-medium">{callout.imageName}</span>
                            <span className="text-gray-400 ml-2">
                                ({callout.location.x.toFixed(2)}, {callout.location.y.toFixed(2)})
                            </span>
                        </div>
                        <button
                            onClick={() => onRemoveCallout(index)}
                            className="text-red-400 hover:text-red-500"
                        >
                            <FontAwesomeIcon icon="fa-solid fa-trash"/>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const Notification = ({status, setStatus}) => {
    useEffect(() => {
        let timer;
        if (status) {
            timer = setTimeout(() => {
                setStatus("");
            }, 2000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [status, setStatus]);

    if (!status) return null;

    return (
        <div
            className={`fixed bottom-6 left-6 p-4 rounded-lg shadow-lg transition-all duration-300 transform max-w-md ${
                status.includes('Erreur')
                    ? 'bg-red-600 text-white border-l-4 border-red-800'
                    : 'bg-emerald-600 text-white border-l-4 border-emerald-800'
            } animate-notification z-50`}
        >
            <div className="flex items-center">
                <div className="shrink-0">
                    {status.includes('Erreur') ? (
                        <FontAwesomeIcon icon="fa-solid fa-circle-xmark" className="h-5 w-5 text-white"/>
                    ) : (
                        <FontAwesomeIcon icon="fa-solid fa-circle-check" className="h-5 w-5 text-white"/>
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
    );
}

function App() {
    const [imageCoord, setImageCoord] = useState({x: 0, y: 0});
    const [status, setStatus] = useState("");
    const [selectedMap, setSelectedMap] = useState("pearl");
    const [imgPath, setImgPath] = useState("pearl.png");
    const [filename, setFilename] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [jsonData, setJsonData] = useState({
        difficulty: "easy",
        callouts: []
    });

    const handleMapChange = (map) => {
        if (jsonData.callouts.length > 0) {
            setStatus("Erreur: Réinitialisez le JSON avant de changer de carte!");
            return;
        }

        setSelectedMap(map);
        setImgPath(`${map}.png`);
    };

    const handleDifficultyChange = (difficulty) => {
        if (jsonData.callouts.length > 0) {
            setStatus("Erreur: Réinitialisez le JSON avant de changer de difficulté!");
            return;
        }

        setDifficulty(difficulty);
        setJsonData(prev => ({
            ...prev,
            difficulty
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!filename.trim()) {
            setStatus("Erreur: Le nom du fichier est requis!");
            return;
        }

        const newCallout = {
            imageName: filename + ".png",
            location: {
                x: imageCoord.x,
                y: imageCoord.y
            }
        };

        console.log("New callout:", newCallout);

        setJsonData(prev => ({
            ...prev,
            callouts: [...prev.callouts, newCallout]
        }));

        setFilename("");
        setStatus(`Callout "${filename}" ajouté avec succès!`);
    };

    const handleRemoveCallout = (index) => {
        setJsonData(prev => ({
            ...prev,
            callouts: prev.callouts.filter((_, i) => i !== index)
        }));
        setStatus("Callout supprimé avec succès!");
    };

    const handleResetJson = () => {
        setJsonData({
            difficulty: difficulty,
            callouts: []
        });
        setStatus("JSON réinitialisé avec succès!");
    };

    return (
        <div className="flex items-center justify-center bg-gray-900 w-screen h-screen p-6 gap-4">
            <Notification status={status} setStatus={setStatus}/>

            <div className="w-full h-full flex flex-col items-center justify-start">
                <InteractiveMap
                    imagePath={imgPath}
                    setImageCoord={setImageCoord}
                />
                <div className="mt-3 text-white bg-gray-800 p-3 rounded-lg flex items-center justify-between w-full">
                    <span className="font-mono">x={imageCoord.x.toFixed(4)}, y={imageCoord.y.toFixed(4)}</span>
                </div>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-between">
                <form
                    onSubmit={handleSubmit}
                    className="w-full h-full flex flex-col items-start justify-between p-6 bg-gray-800 rounded-lg shadow-lg max-w-lg">

                    <MapSelector
                        availableMaps={["pearl", "fracture", "ascent", "breeze", "haven", "split", "icebox", "lotus", "bind", "sunset", "abyss"]}
                        title="Choisissez la carte"
                        isAuthorizedToChange={jsonData.callouts.length !== 0}
                        initialMap={selectedMap}
                        onMapChange={handleMapChange}
                    />

                    <DifficultySelector
                        availableDifficulties={["easy", "medium", "hard", "spells"]}
                        title="Choisissez la difficulté"
                        isAuthorizedToChange={jsonData.callouts.length !== 0}
                        initialDifficulty={difficulty}
                        onDifficultyChange={handleDifficultyChange}
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
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-md p-3 text-sm font-medium w-full flex items-center justify-center transition duration-300 ease-in-out"
                    >
                        <FontAwesomeIcon icon="fa-solid fa-circle-plus" className="mr-2"/>
                        Ajouter au JSON
                    </button>
                </form>
            </div>

            <JsonGenerator
                jsonData={jsonData}
                mapName={selectedMap}
                difficulty={difficulty}
                onReset={handleResetJson}
                onRemoveCallout={handleRemoveCallout}
            />
        </div>
    );
}

export default App;